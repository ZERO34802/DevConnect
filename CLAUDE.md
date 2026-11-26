# CLAUDE.md — DevConnect

## What this is
Karthik's TypeScript code-along of the DevTinder project from Namaste Node.js Season 2
(Akshay Saini). It is a learning project for interview prep, split out of the
`abridge-interview-prep` repo on 2026-11-25 with full git history. The course teaches
plain JavaScript; everything here is rewritten in strict TypeScript.

## How to work with Karthik
- This is a learning project. Karthik types the code himself. Do not write whole
  features unless explicitly asked; small snippets that illustrate a point are fine.
- When he asks for a hint, give a hint, not the answer.
- He is new to regex, TypeScript narrowing, and async error handling. Explain the
  why, not just the fix, and keep explanations concrete with short examples.
- Follow the global CLAUDE.md: surgical changes, no refactoring beyond the ask,
  match existing style.

## Stack and conventions
- Express 5 (not 4 as the README says). Rejected promises in async handlers reach
  error middleware automatically.
- Mongoose 9, jsonwebtoken 9, bcrypt, cookie-parser, validator.
- ES modules. Local imports use the `.js` suffix even for `.ts` files.
- `tsconfig` is `strict: true`, so `catch (err)` is `unknown` and must be narrowed.
- Run: `npm run dev` (tsx watch), `npm run typecheck` (tsc --noEmit). Run typecheck
  after any change.
- `.env` holds the Mongo connection string and is gitignored.

## Patterns already established
- `src/utils/HttpError.ts`: `class HttpError extends Error { status }`. Routes throw
  it; catch blocks narrow with `instanceof HttpError` and send `err.status`.
- `src/utils/validation.ts`: type guards (`x is T`) for signup and login bodies,
  using `validator.isEmail` and `validator.isStrongPassword`.
- `src/middlewares/auth.ts`: `userAuth` reads the `token` cookie, verifies the JWT,
  loads the user, sets `req.user`, calls `next()`.
- `src/types/express.d.ts`: module augmentation adding `user?: any` to
  `Express.Request`. Nothing imports it; tsconfig `include` picks it up.
- JWT: `jwt.sign` / `jwt.verify` are synchronous. Secret is the literal
  `"testingjwt"` for now. Token expires in 7d. Cookie name is `token`.
- Passwords are hashed with `bcrypt.hash(pw, 10)` at signup and checked with
  `bcrypt.compare` at login. All login failures return the same 401.

## Known leftovers (not yet done, in rough priority)
- Catch blocks map `jwt.JsonWebTokenError` to 500. Add a branch returning 401.
- `await` in front of `jwt.sign` (app.ts) and `jwt.verify` (auth.ts) is unnecessary.
- Move the JWT secret to `.env`.
- `GET /user/email` reads `req.body`; should use a query string.
- `bcrypt` and `cookie-parser` are under `devDependencies`; move them to `dependencies`.
- `@types/express` is v4 while `express` is v5; install `@types/express@5`.
- Tighten `req.user` from `any` to the Mongoose document type.
- Course progress: through Ep 10 (JWT and cookies). Next is Ep 11, Express Router.
