# GROW backend security audit

Reviewed 20 August 2026. Scope: every route under `app/api` and all server actions (`"use server"` search returned none).

## Shared controls

- `currentUser()` resolves only a hashed, unexpired HttpOnly session cookie. Expired rows are removed.
- `requireUser()`, `requireRole()` and `requireOwnership()` are the central authentication, role and ownership primitives. API routes either call these or use `currentUser()` directly and scope every query to its returned `user.id`.
- All state-changing browser requests require same-origin validation. Mutation payloads and route identifiers use Zod or accept no input.
- XP is granted only by `awardXp()` and the database unique key `(userId, sourceType, sourceId)`. Achievement, learning, video and mission progress have database uniqueness constraints.
- Request IDs are propagated by `proxy.ts`. Structured logs redact password, token, secret, cookie, authorization and API-key shaped fields.

## Route inventory

| Routes | Identity / authority | Validation and ownership conclusion |
| --- | --- | --- |
| `/api/auth/register`, `/login`, `/forgot-password`, `/reset-password`, `/logout` | Public credential flows; logout uses the server cookie | Zod on supplied bodies, generic account errors, hashing, expiring hashed reset tokens, same-origin mutations and rate limiting. No client role or user ID accepted. |
| `/api/goals`, `/api/goals/[id]`, `/api/goals/[id]/contributions` | Session user | Goal records are created with session `user.id`; reads and mutations scope to that ID through `requireOwnership`; IDs and bodies are Zod validated; contribution and balance updates are transactional. Cross-user IDs return 404. |
| `/api/learn/[slug]/complete`, `/api/videos/[id]/complete`, `/captions` | Session profile and current age group | Slugs/IDs are validated, content must be published for the signed-in age group, progress is unique, and XP is ledger-backed. The client cannot submit XP or completion status. |
| `/api/missions/[slug]`, `/api/activities/complete` | Session user | Generic browser-declared progress was removed. Only the market-drop answer evidence is accepted directly; other missions complete from server-observed learning activities. Mission XP and achievements are replay-safe. |
| `/api/investment-simulator`, `/api/simulator` | Session user | The client supplies bounded choices only. Starting value, ending value, change, deterministic timeline and insights are calculated server-side. Unknown submitted return fields are ignored and invalid allocations fail. Stored runs always use the session user. |
| `/api/practice/budget`, `/api/practice/decisions/[topic]`, `/api/practice/reflection` | Session user | Scenario and outcome calculations are server-owned. Age controls scenario access. Reflection links use `requireOwnership`; XP is ledger-backed and multi-record writes are transactional. |
| `/api/guardian/request`, `/decision`, `/status` | Retired compatibility routes | Guardian approval is not part of the ages 15–18 product. Legacy mutation routes return `410` and the status route reports `NOT_REQUIRED`; no new approval data is created. |
| `/api/profile/onboarding`, `/avatar`, `/preferences`, `/content-signal` | Session profile | Strict bounded Zod payloads; updates address only the session profile. Browser-supplied user, role, XP and confidence totals are not accepted. |
| `/api/admin/presenter`, `/admin/content`, `/admin/videos` | Server-side ADMIN or CONTENT_EDITOR role | Presenter Mode remains ADMIN-only. Content/video routes enforce role before database or storage mutation. Upload bytes, MIME signatures and sizes are validated. Prepare Demo is a single deterministic transaction. |
| `/api/media/[key]` | Read-only media resolver | Isolated storage abstraction validates lookup keys; no database ownership mutation or writable path is exposed. |
| `/api/health` | Public, read-only | Performs only `SELECT 1`; returns reachability, latency, timestamp and request ID without configuration, paths, credentials or record counts. |

## Evidence boundary

`EvidenceSource` stores optional metadata separately from lessons and product execution. `isDemo` prevents a prototype note being presented as research. The seed contains only a clearly labelled GROW demonstration note and no fabricated external citation.

## Adversarial evidence

`tests/backend-strengthening.test.mjs` covers unauthenticated and expired sessions, role escalation, cross-user goal mutation, reward replay, achievement duplication, forged mission completion, simulated-return tampering, invalid allocation, retired guardian routes and deterministic demo resets. The demo persona remains age 16; attempts to restore the retired age-24 mode are rejected. Sprout reaction tests verify concise, non-advisory explanations.

