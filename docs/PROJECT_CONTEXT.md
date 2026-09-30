# Kaamly — Project Context

## What is Kaamly?

Kaamly is a **services marketplace** mobile app. The first category is
**cycle repair**: a customer picks a location, browses nearby cycle shops,
selects a mechanic, and books them for a doorstep repair.

Long-term, Kaamly will grow into a JustDial-style platform with many service
categories. The database and API are kept generic where it's cheap to do so,
but **all screens and user-facing wording are cycle-specific for now**.

## Product Reference

The full product concept lives in:
`docs/cycle-repair-marketplace-concept.md`

Read it for user flows, screen descriptions, and feature details.
**However, the tech-stack sections in that file are overridden by the stack
listed below.**

## Tech Stack (authoritative)

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Backend  | Node.js + Express — plain JavaScript (no TypeScript on server)    |
| Database | MySQL via the `mysql2` package — plain SQL queries, **no ORM**    |
| Auth     | JWT + `bcryptjs` — three roles: `CUSTOMER`, `MECHANIC`, `ADMIN`   |
| Mobile   | React Native with **Expo**, TypeScript, and **Expo Router**       |
| Admin    | Separate web dashboard — will be added later                      |

### Mobile app note

There is **one** mobile app for both customers and mechanics.
After login the app checks the user's role and shows the correct set of
screens (customer screens or mechanic screens).

## Folder Layout

```
Kaamly/
├── backend/   — Express API server
├── mobile/    — Expo / React Native app
├── docs/      — Product docs & context
├── admin/     — (added later) Web admin dashboard
├── .gitignore
└── README.md
```

## Rules for Every Task

1. **Build only what the task asks for** — no extra features or screens.
2. **Explain non-obvious things** in short code comments.
3. **Tell the user what each command does** before running it.
4. Read this file first for context; read the concept file for product detail.
