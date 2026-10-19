# CLAUDE.md

Project-specific instructions for Aurell Gira Board. Where this file is more specific than a parent CLAUDE.md (folder layout, module system, response shape), this file wins.

## Layout

Two independent npm projects — always `cd` into one before running npm. There is no root `package.json`.

- `server/` — Express 5 + Mongoose 9, **CommonJS** (`require`/`module.exports`), entry `server.js` (DB connect + listen), `app.js` (Express app, exported for tests)
  - `routes/` → `controllers/` → `models/`; `middleware/authMiddleware.js`; `utils/jwt.js`, `utils/validate.js`
  - `tests/` — Jest + Supertest; models are `jest.mock`ed, no DB
- `frontend/` — Next.js 15 App Router, React 19, TypeScript, Tailwind 4 + CSS modules
  - `app/api/api.ts` — axios instance (attaches token, refreshes on 401); `app/api/endpoints.ts` — all API calls
  - `app/cards/` board (`Cards.tsx`) and create form (`card/Card.tsx`); `app/components/`; `app/utils/`
  - `tests/unit/` — Jest via `next/jest`; import test globals from `@jest/globals`
- `PythonTests/` — manual smoke scripts against a running API (create real data; not run in CI)

## Commands

```bash
cd server   && npm test                                  # API tests
cd frontend && npx tsc --noEmit && npm test && npm run build
```

CI (`.github/workflows/ci.yml`) runs exactly these; run them before committing. There is no ESLint/Prettier config yet — `next lint` is not set up.

## Conventions

- **API paths**: backend mounts `/auth`, `/card`, `/user`. Frontend calls go through `endpoints.ts`, and `tests/unit/endpoints.test.ts` pins every path — update both together.
- **Responses**: success returns the resource or `{ message }`; errors return `{ message }` with a proper status (`400` validation, `401` missing/expired token, `403` forbidden, `404`, `409`). Do not switch to a `{ success, data }` envelope without migrating the frontend in the same change.
- **Auth**: every non-`/auth` route uses `authMiddleware`. Identity (`req.user.id`, `req.user.username`) comes from the token — never trust `username`/`userId` in the request body. Expired access tokens must return `401` (the frontend only refreshes on 401).
- **Tokens**: access 15m (`JWT_SECRET`, payload `{ id, username }`), refresh 7d (`REFRESH_SECRET`, payload `{ id, tokenVersion }`). Logout increments `User.tokenVersion` to revoke refresh tokens. Frontend stores tokens and `username` in `localStorage`.
- **Validation**: validate type and length of every body field in the controller (see `utils/validate.js`) before touching the DB. `mongoose.set('sanitizeFilter', true)` is on; still never pass raw objects from `req.body` into queries.
- **Logging**: never log tokens, passwords, `MONGO_URI` or full request bodies. Log `err.message` in controllers.
- Comments in the codebase mix Swedish and English; either is fine, keep new ones short.

## Config and secrets

- `server/.env` is git-ignored (template: `server/.env.example`). Production secrets live in `fly secrets` for `aurellgiracard-backend`.
- `NEXT_PUBLIC_API_URL` is inlined at build time: `.env.local` locally, `[build.args]` in `frontend/fly.app.toml` for production.
- CORS origins: `CLIENT_URL` (comma-separated) in `server/app.js`.
- Never commit `.env*` files, credentials, tokens, or curl snippets containing them.

## Deployment

Pushes to `master` deploy both Fly apps after CI passes (`fly.server.toml`, `fly.app.toml`, region `arn`). Changing Dockerfiles, Fly configs or workflows affects production — call it out in the PR.

## Data model

- `User`: `username` (unique), `passwordHash`, `pictureUrl` (base64 data URL or http(s), ≤1.5 MB), `tokenVersion`, embedded `layout { cols, headers[], cards[] }`
- `Card`: `rating` 1–5, `comment`, `productId` (shown as "Issue Key"), `username` (author), `submittedAt`

Schema changes need the user's approval.

## Git

Branch from `master` as `feature/<desc>` or `fix/<desc>`; Conventional Commits; open a PR, never push to or merge into `master` directly.
