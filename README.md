<div align="center">

# DevConnect

**A backend for developers to find and connect with other developers.**

Express 5 · TypeScript · MongoDB · JWT

</div>

---

DevConnect is a REST API where developers create a profile, browse a feed of other
developers, and send connection requests. Think of it as a matchmaking service built
around skills instead of selfies.

The whole codebase is strict TypeScript: every request body is validated with type
guards before it touches the database, errors carry their own HTTP status, and nothing
is typed `any` on purpose.

## Features

- **Secure sign-up and login.** Passwords are hashed with bcrypt before storage. Login
  issues a signed JWT that lives in an HTTP cookie and expires after seven days.
- **Protected routes.** A reusable `userAuth` middleware verifies the token, loads the
  user, and attaches it to the request. Routes never touch the token themselves.
- **Input validation at the edge.** Type guards reject malformed bodies before any
  query runs, which also blocks NoSQL operator injection. Emails are checked with
  `validator`, passwords must meet a strength rule, and age must be 18 or over.
- **Consistent error responses.** A small `HttpError` class carries the status code with
  the message, so every route reports failures the same way.
- **Schema-level guarantees.** Mongoose enforces unique lowercase emails, trimmed
  names, password strength, an allowed set of genders, and timestamps on every document.

## Tech stack

| Layer | Choice |
|---|---|
| Runtime | Node.js, ES modules |
| Framework | Express 5 |
| Language | TypeScript, `strict` mode |
| Database | MongoDB Atlas via Mongoose 9 |
| Auth | jsonwebtoken, bcrypt, cookie-parser |
| Validation | validator, custom type guards |
| Dev loop | tsx watch |

## Getting started

```bash
git clone https://github.com/ZERO34802/DevConnect.git
cd DevConnect
npm install
```

Create a `.env` file in the project root:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
```

Then run:

```bash
npm run dev        # start with auto-reload on http://localhost:3000
npm run typecheck  # strict type check, no emit
```

## API

### Live

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/signup` | – | Create an account |
| POST | `/login` | – | Verify credentials, set the `token` cookie |
| GET | `/profile` | cookie | Return the logged-in user's profile |
| PATCH | `/user/updateGender` | – | Update a user's gender |
| GET | `/feed` | – | List all users |

### Planned

- `POST /logout`
- `GET /profile/view/:userId`, `PATCH /profile/edit/details`, `PATCH /profile/edit/password`
- Connection requests: `interested`, `ignore`, `accepted`, `rejected` per user
- `GET /user/view/requests`, `GET /user/view/messages`
- Paginated feed that hides users you have already acted on

## Project structure

```
src/
├── app.ts               # Express app, middleware, router mounting
├── config/
│   └── database.ts      # Mongoose connection
├── middlewares/
│   └── auth.ts          # userAuth: verify JWT, attach req.user
├── models/
│   └── user.ts          # User schema with validation rules
├── routes/
│   ├── auth.ts          # /signup, /login
│   ├── profile.ts       # /profile, /user/updateGender
│   ├── user.ts          # /feed
│   └── requests.ts      # connection requests (in progress)
├── types/
│   └── express.d.ts     # adds `user` to Express.Request
└── utils/
    ├── HttpError.ts     # Error subclass carrying an HTTP status
    └── validation.ts    # type guards for request bodies
```

## Design notes

- **Why type guards instead of a schema library.** Writing `x is UserSignUpData` guards by
  hand keeps the project dependency-light and makes the narrowing explicit. The guards
  double as documentation for what each endpoint accepts.
- **Why a custom `HttpError`.** Throwing an error that knows its own status lets route
  code stay linear: validate, query, respond. The catch block decides the response shape
  once.
- **Why the same 401 for every login failure.** Distinguishing "no such email" from
  "wrong password" tells an attacker which emails are registered.

## Roadmap

- [ ] Logout and token invalidation
- [ ] Profile edit endpoints scoped to the logged-in user
- [ ] Connection request model and endpoints
- [ ] Feed pagination and filtering
- [ ] Move the JWT secret to environment config
- [ ] Automated tests
