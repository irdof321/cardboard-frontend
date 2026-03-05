# CardBoard 📋

A **Trello-like project management app** built as a fullstack exercise to demonstrate hands-on skills with Django/DRF and Remix/React Router.

> Built in ~4 days from scratch — no prior Remix experience.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django + Django REST Framework |
| Frontend | Remix (React Router v7) |
| Auth | JWT (simplejwt) — access token 5min + refresh 1 day |
| Session | Cookie httpOnly — token never exposed to browser |
| DB | SQLite |

---

## Features

### Backend — fully implemented
- Full CRUD on **Boards**, **Columns**, and **Cards**
- Role-based permissions: `superuser` / `is_staff` / `board owner` / `board member`
- JWT authentication with automatic token refresh
- Nested serializers — columns return their cards in a single API call
- `get_queryset` filtering — users only see boards they own or are members of
- `validate()` — business logic: assignment rules, status/priority restrictions, board membership checks
- `get_fields()` — dynamic read-only fields based on user role
- `TextChoices` for status and priority — single source of truth via `/api/cards/card_choices/`
- `distinct()` — prevents duplicate boards when user is both owner and member

### Frontend — card actions implemented
- Login with session stored in httpOnly cookie
- Board view: loads board + columns + cards + choices + members in parallel (`Promise.all`)
- Card status and priority update via auto-submit onChange forms
- Card creation and deletion
- Centralized `fetchWithAuth()` — handles token refresh transparently on 401
- Toast notifications via URL message passing (`encodeURIComponent`)
- `openColumnId` state — one form open at a time per column

---

## Architecture

```
Browser
   ↕ (cookie httpOnly — JWT never visible to JS)
Remix Server (Node.js)
   — loader() / action() run server-side
   — fetchWithAuth() handles token + refresh
   ↕ REST API (Authorization: Bearer ...)
Django Server (Python)
   — ViewSets + Serializers + Permissions
   — SQLite DB
```

---

## Security highlights

- JWT stored in **httpOnly cookie** — protected against XSS attacks
- `get_queryset` as implicit security — unauthorized objects return 404, not 403
- Permission layering: `get_permissions` → `get_queryset` → `get_object` → `validate` → `perform_*`

---

## Known limitations / improvements

- No concurrent edit handling (optimistic locking with `updated_at` would solve this)
- Frontend partially implemented — board/column CRUD not yet in UI
- Missing `perform_create` in BoardViewSet to auto-assign owner server-side

---

## Run locally

```bash
# Frontend
cd mon-frontend
npm install
npm run dev
```