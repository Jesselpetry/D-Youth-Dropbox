# Database Schema

All tables live in the default `public` schema of the Supabase (PostgreSQL) project.

---

## `profiles`

Stores one row per registered user. The `id` column matches the Supabase Auth `users.id` (UUID).

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | NO | Primary key — matches `auth.users.id` |
| `user_name` | `text` | YES | Display name chosen by the user |
| `profile_img` | `text` | YES | Public URL of the avatar (Supabase Storage) |
| `year` | `text` | YES | D-Youth cohort year (e.g. `"68"`) |
| `province` | `text` | YES | Thai province name |
| `ig` | `text` | YES | Instagram handle (without `@`) |

**Row-Level Security:** Each user can read all profiles but may only write to their own row.

---

## `walls`

Public message board. Each row is one "paper" posted to the wall.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `bigint` | NO | Auto-increment primary key |
| `created_at` | `timestamptz` | NO | Insert timestamp (default `now()`) |
| `content` | `text` | NO | Message text (max 160 characters enforced client-side) |
| `sender_id` | `uuid` | YES | FK → `profiles.id`; `NULL` when anonymous |
| `color` | `text` | YES | Hex background colour of the paper card |
| `is_anonymous` | `boolean` | YES | `true` hides the sender's identity |

**Relationships:**
- `walls.sender_id → profiles.id` (nullable foreign key)

**Row-Level Security:** Anyone can read; authenticated users can insert; only the owner can delete.

---

## `messages`

Private direct messages sent between members.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `bigint` | NO | Auto-increment primary key |
| `created_at` | `timestamptz` | NO | Insert timestamp (default `now()`) |
| `content` | `text` | NO | Message text |
| `sender_id` | `uuid` | YES | FK → `profiles.id`; `NULL` when anonymous |
| `receiver_id` | `uuid` | NO | FK → `profiles.id` |
| `color` | `text` | YES | Hex background colour of the message card |
| `is_anonymous` | `boolean` | YES | `true` hides the sender's identity |

**Relationships:**
- `messages.sender_id → profiles.id` (nullable)
- `messages.receiver_id → profiles.id` (required)

**Row-Level Security:** A user can only read messages where they are the `receiver_id`.

---

## Supabase Storage

| Bucket | Access | Path pattern | Description |
|---|---|---|---|
| `avatars` | Public | `avatars/{userId}.{ext}` | User profile photos |

---

## Entity-Relationship Diagram (simplified)

```
auth.users (Supabase managed)
    │ 1
    │
    ▼ 1
profiles
    │ 1
    ├──────────────────────────┐
    │                          │
    ▼ 0..*                     ▼ 0..*
walls                       messages
(sender_id)           (sender_id / receiver_id)
```
