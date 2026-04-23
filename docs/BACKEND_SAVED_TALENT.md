# Backend: Client saved talent (bookmark freelancers)

The frontend expects authenticated **CLIENT** users to bookmark freelancers from search and view them under **Talent you've saved** (`/client/saved-talent`).

## Data model

Create a join table (names can match your DB conventions):

| Column           | Type        | Notes |
|------------------|-------------|--------|
| `id`             | UUID / PK   | Optional if composite PK |
| `client_id`      | FK → users  | The client who saved |
| `freelancer_id`  | FK → users  | Target freelancer (role = FREELANCER) |
| `created_at`     | timestamptz | When saved |

**Constraints:** `UNIQUE (client_id, freelancer_id)` so each pair appears once.  
**Indexes:** `(client_id)`, `(freelancer_id)` for list and reverse lookups.

**Validation:** On save, ensure the target user exists and has role `FREELANCER`. Reject saving self if client and freelancer share the same user row (should not happen with separate roles).

## API (REST)

Base path suggestion: `/api/clients/saved-freelancers` (or `/api/client/saved-talent` — keep one and document it).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/clients/saved-freelancers` | Bearer (CLIENT) | List saved freelancers for the current client. |
| `POST` | `/api/clients/saved-freelancers` | Bearer (CLIENT) | Save a freelancer. |
| `DELETE` | `/api/clients/saved-freelancers/:freelancerId` | Bearer (CLIENT) | Remove one saved freelancer. |

### `POST` body

```json
{ "freelancer_id": "<uuid>" }
```

Idempotent behavior is recommended: if already saved, return `200` with existing row (or `201` on first insert).

### Response shape (align with existing `success` / `data` patterns)

**GET** — return the same freelancer summary fields used elsewhere (e.g. `GET /api/users/all-freelancers`), e.g.:

```json
{
  "success": true,
  "data": [
    {
      "id": "<freelancer user id>",
      "name": "...",
      "title": "...",
      "image": "...",
      "skills": ["..."],
      "rating": 4.8,
      "price": "...",
      "saved_at": "2026-03-29T12:00:00.000Z"
    }
  ]
}
```

Alternatively, `data` may be `{ "freelancers": [...] }` — the frontend normalizes `response.data` or `response.data.data`.

**Errors:** `401` unauthenticated, `403` if not CLIENT, `404` if freelancer not found, `409` optional if you disallow duplicates without idempotency.

## Frontend usage (reference)

- List: `GET` with Bearer token (Supabase JWT validated like other routes).
- Save from search: `POST` with `freelancer_id`.
- Unsave: `DELETE /api/clients/saved-freelancers/:freelancerId`.
