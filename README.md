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
| `/search`  | librarian      | on each title: L1b edit, L1c delete, L2a add a copy  |
| `/desk/circulation` | librarian | L3b check out, L3a return (to maintenance: R-10), L3c lost |
| `/desk/copies`      | librarian | by barcode: L2b condition, L2c maintenance in/out, L3c found |
| `/desk/titles`      | librarian | L1a add a title, L1d restore a deleted one by id |
| `/desk/patrons`     | librarian | L0 enroll; by Member ID: L0b contact, L0c close/reopen, L0d anonymise |
| `/desk/fines`       | librarian | L4c record a payment, then waive/lower its fines (L4a, L4b) or reverse it (L4d) |
| `/desk/reports`     | librarian | L5a overdue, L5b popular titles, L5c active fines, QA-03 reconciliation |

Every desk action lands in the desk log beside the section (the last 20 this session, in memory only).

Not yet: patron notices (`/me/notices`). The desk works from what the librarian types (Member ID, barcode, ids),
because the API has no librarian read side yet; see dotnet-library's backlog (L0e patron lookup, L1e find deleted
titles, L2d a title's copies, the genre list).

## Checks

`npx ng build` (strict TypeScript and templates) and `npx ng test --watch=false` (Vitest).
