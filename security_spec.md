# Security Specification (Payload-First Security TDD)

## 1. Data Invariants
1. **Identity Isolation (PII Boundary)**: Phone numbers and street addresses are never stored on `/technicians/{techId}` or `/repair_jobs/{jobId}`. They reside strictly in `/users/{userId}/private/contact`, `/repair_jobs/{jobId}/private/contact`, and `/repair_jobs/{jobId}/private/tech_contact`.
2. **Owner-Only Profile & Verification Integrity**: Users may only create/update their own `/users/{userId}` and `/technicians/{techId}` documents (`uid == request.auth.uid`), with `email_verified == true`. Technicians cannot self-promote `verificationStatus` to `'verified'`; only a verified Admin (`johnabhinav143@gmail.com` with `email_verified == true`) may mark a technician `'verified'` or suspend `isPublic`.
3. **Job Lifecycle Integrity**: A `/repair_jobs/{jobId}` document must start in `status == 'open'` with `technicianId == ''` and `customerId == request.auth.uid`. Once `completed` or `cancelled`, the job is terminally locked against all further edits. Customers must explicitly approve `priceApproved` or settle payment cleanly through scoped `affectedKeys()`.
4. **Master Gate on Job Subcollections**: `/repair_jobs/{jobId}/private/contact` and `/repair_jobs/{jobId}/messages/{messageId}` strictly verify parent ownership or assignment on `/repair_jobs/{jobId}` via `get()`.
5. **Verified Reviews 1:1**: A `/reviews/{reviewId}` document requires `reviewId == incoming().jobId`, that the parent job exists with `status == 'completed'`, and that the author is the job's `customerId`.
6. **Zero Query Delegation**: Every `allow list` rule explicitly evaluates `resource.data` or verified token claims (`isAdmin()`) without `get()`/`exists()` calls.
7. **Complaint & Notification Isolation**: Reports in `/reports/{reportId}` can be created by verified reporters (`reporterId == request.auth.uid`, `status == 'open'`) and updated only by Admin. Notifications in `/notifications/{notifId}` can only be read/marked-read by `recipientId == request.auth.uid`.
8. **Login Directory PII Isolation**: `/login_records/{recordId}` stores verified emails, phone numbers, organizations, and login counts strictly keyed by `uid == request.auth.uid`, verified against `request.auth.token.email` and `email_verified == true`. Only the owning user can `get` or update their record, and only the verified Admin (`johnabhinav143@gmail.com`) may `list` or inspect all saved login records.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on Technician Create**: `{ "uid": "u1", ..., "isVerifiedBadge": true }` -> `PERMISSION_DENIED` (`hasOnly` rejects extra key).
2. **Self-Verification Privilege Escalation**: Technician writes `verificationStatus: "verified"` on create or owner update -> `PERMISSION_DENIED`.
3. **Unverified Email Write**: Valid job payload with `request.auth.token.email_verified == false` -> `PERMISSION_DENIED`.
4. **Identity Spoofing on Job Create**: `{ "customerId": "victim_uid", ... }` by `"attacker_uid"` -> `PERMISSION_DENIED`.
5. **State Shortcutting on Job Create**: `{ "customerId": "u1", "status": "completed", ... }` -> `PERMISSION_DENIED`.
6. **Non-Technician Accepting a Job**: User without `/technicians/{uid}` doc tries to update `status` to `'accepted'` -> `PERMISSION_DENIED`.
7. **Customer Hijacking Technician Fields**: Customer tries to update `technicianId` on their open job -> `PERMISSION_DENIED` (`affectedKeys().hasOnly` mismatch).
8. **Terminal State Tampering**: Technician tries to modify `quotedFee` after `status == 'completed'` -> `PERMISSION_DENIED`.
9. **PII Leak Attempt (Job Contact)**: Unassigned technician calls `get` on `/repair_jobs/{jobId}/private/contact` -> `PERMISSION_DENIED`.
10. **Resource Poisoning (Oversized ID / Media)**: Document ID > 128 chars or `mediaUrl` > 240000 chars -> `PERMISSION_DENIED`.
11. **Non-Admin List Scraping on Users / Login Records / Reports**: Non-admin calls `list` on `/users` or `/login_records`, or unauthenticated `list` on `/reports` -> `PERMISSION_DENIED`.
12. **Email Spoofing on Login Record Create**: Authenticated user attempts to write `email: "victim@example.com"` into `/login_records/{uid}` mismatching `request.auth.token.email` -> `PERMISSION_DENIED`.
13. **Fake Review on Open Job**: Customer posts `/reviews/{jobId}` while job `status == 'open'` -> `PERMISSION_DENIED`.
