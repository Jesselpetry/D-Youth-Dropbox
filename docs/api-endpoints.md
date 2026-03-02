# API & Data-Access Patterns

D-Youth Dropbox does not expose a custom REST/GraphQL API. All data operations are
performed directly against **Supabase** using the JavaScript SDK.  
This document describes every Supabase query used in the application.

---

## Authentication

### Sign in with Google

```ts
supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: `${siteUrl}/auth/callback` },
})
```

**Used in:** `src/app/login/page.tsx`

### Sign out

```ts
supabase.auth.signOut()
```

**Used in:** `src/app/profile/page.tsx`

### Get current session

```ts
supabase.auth.getSession()   // returns { data: { session } }
supabase.auth.getUser()      // returns { data: { user } }
```

---

## Profiles

### Fetch own profile

```ts
supabase
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .single()
```

**Used in:** `src/app/profile/page.tsx`, `src/app/components/Menu.tsx`

### Fetch all profiles (family directory)

```ts
supabase.from("profiles").select("*")
```

**Used in:** `src/app/family/page.tsx`

### Upsert profile

```ts
supabase.from("profiles").upsert({
  id: userId,
  user_name,
  year,
  province,
  profile_img,
  ig,
})
```

**Used in:** `src/app/profile/page.tsx`, `src/app/setup-profile/`

---

## Walls

### Fetch all wall posts (with sender profile)

```ts
supabase
  .from("walls")
  .select(`
    id, content, created_at, sender_id, color, is_anonymous,
    profiles:sender_id (id, user_name, profile_img, year, province, ig)
  `)
  .order("created_at", { ascending: false })
```

**Used in:** `src/app/components/PaperWall.tsx`

### Insert a wall post

```ts
supabase.from("walls").insert({
  sender_id: isAnonymous ? null : userId,
  content,
  is_anonymous: isAnonymous,
  color,
})
```

**Used in:** `src/app/walls/send/page.tsx`

---

## Messages

### Fetch inbox messages (with sender & receiver profiles)

```ts
supabase
  .from("messages")
  .select(`
    id, content, created_at, sender_id, receiver_id, color, is_anonymous,
    sender:sender_id (id, user_name, profile_img, year, province, ig),
    receiver:receiver_id (id, user_name, profile_img, year, province, ig)
  `)
  .eq("receiver_id", currentUserId)
  .order("created_at", { ascending: false })
```

**Used in:** `src/app/components/MessageWall.tsx`

### Insert a direct message

```ts
supabase.from("messages").insert({
  sender_id: isAnonymous ? null : currentUserId,
  receiver_id: recipientId,
  content,
  is_anonymous: isAnonymous,
  color,
})
```

**Used in:** `src/app/message/[userId]/page.tsx`

---

## Storage (Avatar Upload)

### Upload avatar

```ts
supabase.storage
  .from("avatars")
  .upload(`avatars/${userId}.${ext}`, file, { upsert: true, contentType: file.type })
```

### Get public URL

```ts
supabase.storage.from("avatars").getPublicUrl(`avatars/${userId}.${ext}`)
```

**Used in:** `src/app/profile/page.tsx`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | optional | Full origin URL used for OAuth redirect (defaults to `window.location.origin`) |
