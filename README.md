# library-web

The browser client for [dotnet-library](../dotnet-library) (Q-20): Angular 22, standalone components, signals,
`resource()`, zoneless, lazy-loaded routes. Angular is the view only: every rule lives in the API, so a facade calls a
service directly and the screen shows the API's own refusal messages.

## Run it

1. In `../dotnet-library`: `docker compose up -d` (Postgres on 5433, Keycloak on 8080), then
   `dotnet run --project Library.Api` (http://localhost:5074).
2. Here: `npm install`, then `npm start`. Open http://localhost:4200.

Sign in through Keycloak as `patron`/`patron` or `librarian`/`librarian` (the realm is `keycloak/library-realm.json`
in dotnet-library; this app is its `library-web` client, Authorization Code + PKCE). The patron must be enrolled first
(the `enrollRealmPatron` request in `Library.Api.http`); the first `/me` call links the login to them.

The dev server proxies `/api/*` to the API (`proxy.conf.json`), so the API needs no CORS. A production build needs the
same: serve the app and the API under one origin, with `/api` routed to the API.

## Layout

```
src/app/
├── core/
│   ├── auth/       Session (who is signed in, roles from the id token), roleGuard, Keycloak settings
│   ├── http/       toApiError: the API's { code, message } → what the screen shows
│   ├── models/     response shapes, one file per API area
│   ├── services/   HttpClient wrappers, the only place that knows URLs
│   └── facades/    signals + resource() per screen area; mutations return an Outcome
├── features/<name>/{container,presentation}/   container = facade wiring, presentation = input()/output() only
└── shared/components/                          loading, error banner, empty state, flash
```

## Screens

| Route      | Who            | Stories                                             |
|------------|----------------|-----------------------------------------------------|
| `/`        | anyone         | sign in                                             |
| `/search`  | signed in      | P1 search; patron: P2 borrow, P3 place hold          |
| `/account` | patron         | P5 my account; P4 renew, P6 cancel hold              |

Next: the librarian desk (titles L1a–L1d, copies L2a–L2c, desk checkout/return L3a–L3c, patrons L0–L0d, fines
L4a–L4d, reports L5a–L5c) and patron notices (`/me/notices`).

## Checks

`npx ng build` (strict TypeScript and templates) and `npx ng test --watch=false` (Vitest).
