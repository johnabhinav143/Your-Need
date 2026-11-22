import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import OpenAI, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
} from 'openai';
import type { EasyInputMessage } from 'openai/resources/responses/responses';

dotenv.config({ override: true });

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_ITEMS = 10;
const MAX_HISTORY_TEXT_LENGTH = 800;
const OPENAI_TIMEOUT_MS = 25_000;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_TRACKED_IPS = 2000;
const rateLimitStore = new Map<string, number[]>();

app.use(express.json({ limit: '64kb' }));

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err && typeof err === 'object' && 'type' in err && (err as { type?: string }).type === 'entity.too.large') {
    res.status(413).json({ error: 'Request payload is too large. Please shorten your message.' });
    return;
  }
  if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
    res.status(400).json({ error: 'Invalid JSON request body.' });
    return;
  }
  next(err);
});

interface AssistantTurn {
  role?: string;
  text?: string;
}

const VALID_CATEGORIES = [
  'fan',
  'ac',
  'fridge',
  'washing_machine',
  'electrical',
  'microwave',
  'geyser',
  'tv_electronics',
  'water_purifier',
  'plumbing',
  'carpentry',
  'other',
] as const;

function sanitizeContextValue(value: unknown, fallback: string, maxLen = 48): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, maxLen);
  return cleaned || fallback;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim().slice(0, 64);
  }
  return (req.ip || req.socket.remoteAddress || 'unknown').slice(0, 64);
}

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  if (rateLimitStore.size > MAX_TRACKED_IPS) {
    for (const [ip, timestamps] of rateLimitStore.entries()) {
      const recent = timestamps.filter((t) => t > windowStart);
      if (recent.length === 0) {
        rateLimitStore.delete(ip);
      } else {
        rateLimitStore.set(ip, recent);
      }
      if (rateLimitStore.size <= MAX_TRACKED_IPS / 2) break;
    }
  }

  const existing = (rateLimitStore.get(clientIp) || []).filter((t) => t > windowStart);
  if (existing.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldestInWindow = existing[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldestInWindow + RATE_LIMIT_WINDOW_MS - now) / 1000));
    rateLimitStore.set(clientIp, existing);
    return { allowed: false, retryAfterSec };
  }

  existing.push(now);
  rateLimitStore.set(clientIp, existing);
  return { allowed: true, retryAfterSec: 0 };
}

const ASSISTANT_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reply: {
      type: 'string',
      description:
        'Clear, polite, helpful response as YourNeed AI Assistant in the requested user language.',
    },
    shouldSuggestBooking: {
      type: 'boolean',
      description:
        'True only when the user wants to book a repair/service or find a technician (e.g. electrician, AC technician, broken appliance). False for general questions or technician registration queries.',
    },
    suggestedCategory: {
      type: 'string',
      enum: [...VALID_CATEGORIES],
      description: 'Best matching YourNeed service category.',
    },
    suggestedTitle: {
      type: 'string',
      description: 'Concise booking headline (max 90 chars) if shouldSuggestBooking is true, otherwise empty string.',
    },
    suggestedDescription: {
      type: 'string',
      description: 'Concise problem summary for a technician (max 300 chars) if shouldSuggestBooking is true, otherwise empty string.',
    },
    suggestedUrgency: {
      type: 'string',
      enum: ['urgent_today', 'within_24h', 'flexible'],
      description: 'Urgency level for a booking request.',
    },
    safetyWarning: {
      type: ['string', 'null'],
      description:
        'Short electrical/gas/appliance safety reminder ONLY when discussing electrical, AC, gas, water-heater, or appliance repairs; otherwise null.',
    },
  },
  required: [
    'reply',
    'shouldSuggestBooking',
    'suggestedCategory',
    'suggestedTitle',
    'suggestedDescription',
    'suggestedUrgency',
    'safetyWarning',
  ],
} as const;

const GEMINI_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description:
        'Clear, polite, helpful response as YourNeed AI Assistant in the requested user language.',
    },
    shouldSuggestBooking: {
      type: Type.BOOLEAN,
      description:
        'True only when the user wants to book a repair/service or find a technician.',
    },
    suggestedCategory: {
      type: Type.STRING,
      enum: [...VALID_CATEGORIES],
      description: 'Best matching YourNeed service category.',
    },
    suggestedTitle: {
      type: Type.STRING,
      description:
        'Concise booking headline (max 90 chars) if shouldSuggestBooking is true, otherwise empty string.',
    },
    suggestedDescription: {
      type: Type.STRING,
      description:
        'Concise problem summary for a technician (max 300 chars) if shouldSuggestBooking is true, otherwise empty string.',
    },
    suggestedUrgency: {
      type: Type.STRING,
      enum: ['urgent_today', 'within_24h', 'flexible'],
      description: 'Urgency level for a booking request.',
    },
    safetyWarning: {
      type: Type.STRING,
      nullable: true,
      description:
        'Short electrical/gas/appliance safety reminder ONLY when discussing electrical, AC, gas, water-heater, or appliance repairs; otherwise null.',
    },
  },
  required: [
    'reply',
    'shouldSuggestBooking',
    'suggestedCategory',
    'suggestedTitle',
    'suggestedDescription',
    'suggestedUrgency',
  ],
};

interface ParsedAssistantPayload {
  reply?: string;
  shouldSuggestBooking?: boolean;
  suggestedCategory?: string;
  suggestedTitle?: string;
  suggestedDescription?: string;
  suggestedUrgency?: string;
  safetyWarning?: string | null;
}

function formatAssistantPayload(rawText: string, originalMessage: string) {
  let parsed: ParsedAssistantPayload = {};
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = { reply: rawText, shouldSuggestBooking: false, safetyWarning: null };
  }

  const replyText =
    typeof parsed.reply === 'string' && parsed.reply.trim()
      ? parsed.reply.trim()
      : rawText;

  const cat = VALID_CATEGORIES.includes(
    parsed.suggestedCategory as (typeof VALID_CATEGORIES)[number]
  )
    ? parsed.suggestedCategory!
    : 'other';

  const urgency =
    parsed.suggestedUrgency === 'urgent_today' ||
    parsed.suggestedUrgency === 'within_24h' ||
    parsed.suggestedUrgency === 'flexible'
      ? parsed.suggestedUrgency
      : 'within_24h';

  const cleanSafetyWarning =
    typeof parsed.safetyWarning === 'string' && parsed.safetyWarning.trim()
      ? parsed.safetyWarning.trim()
      : undefined;

  return {
    reply: replyText,
    safetyWarning: cleanSafetyWarning,
    bookingDraft: parsed.shouldSuggestBooking
      ? {
          category: cat,
          issueTitle: (parsed.suggestedTitle?.trim() || originalMessage).slice(0, 95),
          issueDescription: (parsed.suggestedDescription?.trim() || originalMessage).slice(
            0,
            450
          ),
          urgency,
        }
      : null,
  };
}

async function callGeminiAssistant(params: {
  geminiKey: string;
  instructions: string;
  historyItems: EasyInputMessage[];
  message: string;
}): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: params.geminiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const conversationContents = [
    ...params.historyItems.map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(item.content) }],
    })),
    {
      role: 'user',
      parts: [{ text: params.message }],
    },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: conversationContents,
    config: {
      systemInstruction: params.instructions,
      responseMimeType: 'application/json',
      responseSchema: GEMINI_RESPONSE_SCHEMA,
    },
  });

  return (response.text ?? '').trim();
}

function isQuotaExhaustedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as { code?: unknown; type?: unknown; message?: unknown };
  const code = typeof anyErr.code === 'string' ? anyErr.code : '';
  const type = typeof anyErr.type === 'string' ? anyErr.type : '';
  const msg = typeof anyErr.message === 'string' ? anyErr.message.toLowerCase() : '';
  return (
    code === 'credit_balance_exhausted' ||
    code === 'insufficient_quota' ||
    type === 'insufficient_quota' ||
    msg.includes('no credits remaining') ||
    msg.includes('exceeded your current quota')
  );
}

app.post('/api/assistant', async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    res.setHeader('Retry-After', String(rateCheck.retryAfterSec));
    res.status(429).json({
      error: `Too many messages sent. Please wait ${rateCheck.retryAfterSec}s and try again.`,
    });
    return;
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({ error: 'Invalid request payload.' });
    return;
  }

  const body = req.body as {
    message?: unknown;
    history?: unknown;
    regionName?: unknown;
    currencyCode?: unknown;
    languageName?: unknown;
    roleView?: unknown;
  };

  if (typeof body.message !== 'string') {
    res.status(400).json({ error: 'Please type a message before sending.' });
    return;
  }

  const message = body.message.trim();
  if (!message) {
    res.status(400).json({ error: 'Please type a message before sending.' });
    return;
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({
      error: `Message is too long (${message.length}/${MAX_MESSAGE_LENGTH} characters). Please shorten your question.`,
    });
    return;
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  if (!openaiKey && !geminiKey) {
    res.status(503).json({
      error:
        'YourNeed AI Assistant is not configured yet. Please set OPENAI_API_KEY or GEMINI_API_KEY in Settings > Secrets.',
    });
    return;
  }

  const regionName = sanitizeContextValue(body.regionName, 'Global');
  const currencyCode = sanitizeContextValue(body.currencyCode, 'USD', 12);
  const languageName = sanitizeContextValue(body.languageName, 'English', 32);
  const roleView =
    body.roleView === 'technician'
      ? 'Technician (Service Provider)'
      : 'Customer (Homeowner)';

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;

  const instructions = [
    'You are "YourNeed AI Assistant", the official intelligent assistant built into the YourNeed application.',
    `Active session context (non-PII): Region = ${regionName}, Currency = ${currencyCode}, Preferred Language = ${languageName}, Current View = ${roleView}.`,
    '',
    'About YourNeed:',
    '- YourNeed is a modern on-demand home services & repair marketplace that connects homeowners/customers with verified local technicians and tradespeople.',
    '- Available service categories (12): Ceiling & Exhaust Fans (fan), AC & Cooling (ac), Refrigerator / Fridge (fridge), Washing Machine (washing_machine), Electrician & Wiring (electrical), Microwave & Oven (microwave), Geyser / Water Heater (geyser), TV & Home Electronics (tv_electronics), RO Water Purifier (water_purifier), Plumbing & Pipe Leaks (plumbing), Carpentry & Fixtures (carpentry), and Other Home Services (other).',
    '- How customers book a service: Describe the issue or pick a category via "Book a Repair" (or click "Prepare Booking Request" from an AI booking suggestion), choose a preferred date/time slot, optionally enable "Fast Service / Priority Express" with an express bonus to attract technicians faster, track live milestones (Accepted -> Travelling -> Arrived -> Started -> Completed), message the technician, and receive a digital invoice.',
    '- How technicians / service providers register & receive requests: Sign in, switch to the Technician Dashboard (via the Profile tab or role switcher), complete trade specialty & phone/ID verification details, turn on "On Duty", browse nearby customer requests in the live job feed, accept/claim jobs, update travel and work milestones, and track earnings.',
    '',
    'Assistant responsibilities & rules:',
    '- Help customers find the right service category, explain electrical, plumbing, and appliance repair categories clearly, guide booking steps, explain technician onboarding & job flow, and answer general questions politely and clearly.',
    '- When giving troubleshooting tips, share safe basic checks ONLY (e.g., checking wall switch, circuit breaker, power plug, or water valve). NEVER advise opening live electrical panels, touching exposed wires, disassembling compressors, or performing hazardous gas/electrical repairs.',
    '- Set shouldSuggestBooking=true when the user needs a repair or is looking to hire/find a technician (e.g., "I need an electrician", "How can I find an AC technician?", or describing a broken appliance), and populate suggestedCategory, suggestedTitle, suggestedDescription, and suggestedUrgency.',
    '- Set shouldSuggestBooking=false for general greetings, platform overviews, service category summaries, or technician registration questions.',
    '- Set safetyWarning ONLY when discussing electrical, plumbing/geyser, AC, gas, or appliance repairs; otherwise set safetyWarning to null.',
    '- Respond naturally in the user language (matching Preferred Language unless they write in another language) in a concise, friendly, easy-to-scan format (under ~150 words unless listing categories).',
  ].join('\n');

  const historyItems: EasyInputMessage[] = Array.isArray(body.history)
    ? (body.history as AssistantTurn[])
        .slice(-MAX_HISTORY_ITEMS)
        .filter(
          (item): item is { role?: string; text: string } =>
            Boolean(item) &&
            typeof item === 'object' &&
            typeof item.text === 'string' &&
            item.text.trim().length > 0
        )
        .map((item) => ({
          role: item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user',
          content: item.text.trim().slice(0, MAX_HISTORY_TEXT_LENGTH),
        }))
    : [];

  const tryGeminiFallback = async (): Promise<boolean> => {
    if (!geminiKey) return false;
    try {
      const geminiRaw = await callGeminiAssistant({
        geminiKey,
        instructions,
        historyItems,
        message,
      });
      if (!geminiRaw) return false;
      res.json(formatAssistantPayload(geminiRaw, message));
      return true;
    } catch (geminiErr) {
      console.warn(
        'Gemini assistant fallback failed:',
        geminiErr instanceof Error ? geminiErr.message : String(geminiErr)
      );
      return false;
    }
  };

  if (!openaiKey) {
    const handled = await tryGeminiFallback();
    if (!handled) {
      res.status(502).json({
        error: 'YourNeed AI Assistant could not generate a response. Please verify GEMINI_API_KEY in Settings > Secrets.',
      });
    }
    return;
  }

  const inputMessages: EasyInputMessage[] = [
    ...historyItems,
    {
      role: 'user',
      content: message,
    },
  ];

  const client = new OpenAI({
    apiKey: openaiKey,
    timeout: OPENAI_TIMEOUT_MS,
    maxRetries: 0,
  });

  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await client.responses.create(
      {
        model,
        instructions,
        input: inputMessages,
        max_output_tokens: 550,
        text: {
          format: {
            type: 'json_schema',
            name: 'yourneed_assistant_response',
            strict: true,
            schema: ASSISTANT_RESPONSE_SCHEMA,
          },
        },
      },
      { signal: controller.signal }
    );

    const rawText = (response.output_text || '').trim();
    if (!rawText) {
      if (await tryGeminiFallback()) return;
      res.status(502).json({
        error: 'YourNeed AI Assistant returned an empty response. Please try again.',
      });
      return;
    }

    res.json(formatAssistantPayload(rawText, message));
  } catch (err: unknown) {
    if (err instanceof RateLimitError) {
      const quotaExhausted = isQuotaExhaustedError(err);
      console.warn(
        quotaExhausted
          ? 'OpenAI quota exhausted (429 insufficient_quota)'
          : 'OpenAI transient rate limit (429)'
      );
      if (await tryGeminiFallback()) return;
      res.status(429).json({
        error: quotaExhausted
          ? 'Your OpenAI API key has no remaining billing credits (insufficient_quota). Add credits in OpenAI Billing or configure GEMINI_API_KEY in Settings > Secrets.'
          : 'YourNeed AI Assistant is currently busy due to API rate limits. Please wait a moment and try again.',
      });
      return;
    }

    if (err instanceof APIConnectionTimeoutError || (err instanceof Error && err.name === 'AbortError')) {
      console.warn('OpenAI Responses API timeout');
      if (await tryGeminiFallback()) return;
      res.status(504).json({
        error: 'The AI Assistant took too long to respond. Please try again.',
      });
      return;
    }

    if (err instanceof AuthenticationError) {
      console.warn('OpenAI authentication failed (401)');
      if (await tryGeminiFallback()) return;
      res.status(401).json({
        error: 'OpenAI authentication failed. Please verify the server OPENAI_API_KEY configuration in Settings > Secrets.',
      });
      return;
    }

    if (err instanceof PermissionDeniedError) {
      console.warn('OpenAI permission denied (403)');
      if (await tryGeminiFallback()) return;
      res.status(403).json({
        error: 'The configured OpenAI key does not have permission for this model.',
      });
      return;
    }

    if (err instanceof APIConnectionError) {
      console.warn('OpenAI network connection error');
      if (await tryGeminiFallback()) return;
      res.status(503).json({
        error: 'Unable to connect to the OpenAI service right now. Please check your connection and try again.',
      });
      return;
    }

    if (err instanceof APIError) {
      const upstreamStatus = typeof err.status === 'number' ? err.status : 502;
      console.warn(`OpenAI APIError (${upstreamStatus})`);
      if (await tryGeminiFallback()) return;
      const safeStatus = upstreamStatus >= 400 && upstreamStatus < 500 ? upstreamStatus : 502;
      res.status(safeStatus).json({
        error:
          safeStatus === 400
            ? 'The request could not be processed by the AI model. Please rephrase and try again.'
            : 'The OpenAI service encountered an error. Please try again shortly.',
      });
      return;
    }

    console.warn('Unexpected AI assistant server error:', err instanceof Error ? err.message : String(err));
    if (await tryGeminiFallback()) return;
    res.status(500).json({
      error: 'An unexpected server error occurred while contacting YourNeed AI Assistant.',
    });
  } finally {
    clearTimeout(timeoutTimer);
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Your Need server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
