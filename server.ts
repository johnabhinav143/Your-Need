import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

interface AssistantTurn {
  role: 'user' | 'model';
  text: string;
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

app.post('/api/assistant', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error:
        'AI Assistant is not configured yet. Please add GEMINI_API_KEY in Settings > Secrets.',
    });
    return;
  }

  try {
    const body = req.body as {
      message?: string;
      history?: AssistantTurn[];
      regionName?: string;
      currencyCode?: string;
      languageName?: string;
      roleView?: string;
    };

    const message = (body?.message || '').trim();
    if (!message) {
      res.status(400).json({ error: 'Please type a repair question first.' });
      return;
    }

    const regionName = body?.regionName || 'Global';
    const currencyCode = body?.currencyCode || 'USD';
    const languageName = body?.languageName || 'English';
    const roleView =
      body?.roleView === 'technician'
        ? 'Technician (Servicer)'
        : 'Homeowner (Service Getter)';

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = [
      'You are the AI Service Assistant inside "Your Need", a trusted home appliance and repair platform.',
      `Active user context: Country/Region = ${regionName}, Currency = ${currencyCode}, Language = ${languageName}, Role = ${roleView}.`,
      'Strict safety & booking preparation rules:',
      '- Identify the most appropriate applianceCategory from: fan, ac, fridge, washing_machine, electrical, microwave, geyser, tv_electronics, water_purifier, plumbing, carpentry, other.',
      '- Give clear, safe initial checks ONLY (such as checking if the wall switch or circuit breaker tripped, or unplugging safely).',
      '- NEVER encourage customers to open live electrical panels, touch exposed wiring, disassemble motors/compressors, or attempt dangerous electrical or gas repairs themselves.',
      '- When the user describes a broken appliance (e.g., "My washing machine is not starting"), set shouldSuggestBooking to true and prepare a clean issueTitle, concise issueDescription, and suggestedUrgency ("urgent_today" | "within_24h" | "flexible").',
      '- Reply naturally in the user language (including English, Telugu, Hindi, Tamil, etc. when requested) in under 130 words.',
    ].join('\n');

    const historyItems = Array.isArray(body?.history)
      ? body.history
          .slice(-8)
          .filter((item) => item && typeof item.text === 'string' && item.text.trim().length > 0)
          .map((item) => ({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text.trim() }],
          }))
      : [];

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: [
        ...historyItems,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description:
                'Helpful, safety-first guidance in the requested language with rough local cost expectation if helpful.',
            },
            shouldSuggestBooking: {
              type: Type.BOOLEAN,
              description: 'True when the user described an appliance or home repair issue that can be booked.',
            },
            suggestedCategory: {
              type: Type.STRING,
              description: `One of: ${VALID_CATEGORIES.join(', ')}`,
            },
            suggestedTitle: {
              type: Type.STRING,
              description: 'Short clear headline for the booking request (max 90 chars).',
            },
            suggestedDescription: {
              type: Type.STRING,
              description: 'Concise problem summary prepared for the technician (max 300 chars).',
            },
            suggestedUrgency: {
              type: Type.STRING,
              description: 'One of: urgent_today, within_24h, flexible',
            },
            safetyWarning: {
              type: Type.STRING,
              description: 'Short safety note reminding not to open live electrical wiring.',
            },
          },
          required: ['reply', 'shouldSuggestBooking', 'suggestedCategory'],
        },
      },
    });

    const rawText = (response.text || '').trim();
    if (!rawText) {
      res.status(502).json({
        error: 'The AI assistant returned an empty response. Please try asking again.',
      });
      return;
    }

    let parsed: {
      reply?: string;
      shouldSuggestBooking?: boolean;
      suggestedCategory?: string;
      suggestedTitle?: string;
      suggestedDescription?: string;
      suggestedUrgency?: string;
      safetyWarning?: string;
    } = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { reply: rawText, shouldSuggestBooking: false };
    }

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

    res.json({
      reply: parsed.reply || rawText,
      safetyWarning:
        parsed.safetyWarning ||
        'Do not open electrical panels or live wiring yourself—switch off the breaker and let a verified technician inspect safely.',
      bookingDraft: parsed.shouldSuggestBooking
        ? {
            category: cat,
            issueTitle: (parsed.suggestedTitle || message).slice(0, 95),
            issueDescription: (parsed.suggestedDescription || message).slice(0, 450),
            urgency,
          }
        : null,
    });
  } catch (err: unknown) {
    console.error('AI assistant error:', err);
    const errMsg =
      err instanceof Error
        ? err.message
        : 'Unable to reach the AI assistant right now.';
    const statusMatch = errMsg.match(/\b(400|403|404|429|500|503)\b/);
    const statusCode = statusMatch ? Number(statusMatch[1]) : 500;
    res.status(statusCode).json({ error: errMsg });
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
