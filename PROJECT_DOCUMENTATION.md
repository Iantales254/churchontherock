# Church on the Rock Website Documentation

This document is the working reference for the Church on the Rock website project. It explains the current architecture, the public website, the admin dashboard, the Supabase database integration, environment variables, API routes, image uploads, local development, deployment preparation, and the remaining production work.

## 1. Project Overview

Church on the Rock is a Next.js website for the main church in Nango, Kenya, and its branches in:

- Nyang'oma
- Sifu Island
- Banga
- Lenya
- Onyinyore
- Nyamwang
- Alego
- Asembo

The project has two major experiences:

1. **Public website** at `/`
2. **Protected admin dashboard** at `/admin`

The public website displays church content. The admin dashboard manages content and reads operational records from Supabase.

The current stack is:

- Next.js `16.3.5`
- React `19`
- TypeScript
- Tailwind CSS v4
- Supabase PostgreSQL
- Supabase SSR helpers
- Supabase Storage
- Safaricom Daraja API boundary for M-Pesa STK Push

## 2. Important Current Status

The application currently builds successfully.

Validated commands:

```powershell
npm run build
npm run lint
```

Lint has no blocking errors. There are two existing warnings because the homepage uses external images with raw `<img>` elements.

The website is a working integration baseline, but it is not yet a complete production release. The main remaining production areas are:

- M-Pesa callback verification and transaction persistence
- Contact and newsletter provider configuration
- Rate limiting and abuse protection
- Stronger admin authentication and session management
- Supabase service-role key rotation and deployment configuration
- Automated tests

## 3. Directory Structure

```text
church/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── content-manager.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── records-manager.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── records/route.ts
│   │   │   │   └── upload/route.ts
│   │   │   ├── contact/route.ts
│   │   │   ├── content/route.ts
│   │   │   ├── donations/
│   │   │   │   └── mpesa/
│   │   │   │       ├── route.ts
│   │   │   │       └── callback/route.ts
│   │   │   └── newsletter/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── content-store.ts
│   │   ├── supabase.ts
│   │   └── validation.ts
│   └── utils/
│       └── supabase/
│           ├── client.ts
│           ├── middleware.ts
│           └── server.ts
├── supabase/
│   ├── schema.sql
│   └── storage.sql
├── data/
│   └── content.json
├── public/
├── middleware.ts
├── .env.example
├── .env.local
├── package.json
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── PROJECT_DOCUMENTATION.md
```

## 4. Public Website

The public website is implemented in:

- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`

The homepage is a client component because it includes:

- Mobile navigation state
- Gallery lightbox state
- Fellowship day filtering
- API loading for Supabase-managed content
- Contact form submission
- Newsletter form submission
- M-Pesa donation form submission

### Homepage sections

The homepage currently includes:

1. Hero section
2. Welcome/about section
3. Sunday worship schedule
4. Branch directory
5. Events section
6. Weekday fellowship section
7. Gallery section with lightbox
8. Latest sermon section
9. M-Pesa donation section
10. Contact form
11. Newsletter signup
12. Footer navigation

### Public content loading

The homepage loads the following content types from `/api/content`:

- `branches`
- `events`
- `gallery`
- `sermons`
- `fellowships`

When the database returns no records, the homepage uses fallback display data for branches, gallery, events, sermons, and fellowships. This allows a fresh install to render a useful site before content is entered.

Once Supabase contains records, those records replace the fallback values.

### Important frontend behavior

The homepage fetches content in a `useEffect`. This means the first HTML response can contain fallback content and then update after the browser receives the API results.

The frontend currently uses external image URLs and uploaded Supabase Storage URLs. Image optimization can be improved later by moving all images through `next/image` with a configured remote image host.

## 5. Admin Dashboard

Admin routes:

- `/admin/login`
- `/admin`

The admin page is protected in `src/app/admin/page.tsx`. It reads the `church_admin` HTTP-only cookie and compares it with `ADMIN_SESSION_SECRET` or `ADMIN_PASSWORD`.

### Admin dashboard sections

The dashboard navigation contains:

- Overview
- Events
- Branches
- Sermons
- Gallery
- People
- Fellowships
- Newsletter
- Messages
- Donations

### Content sections

The following sections use `ContentManager`:

- Events
- Branches
- Sermons
- Gallery
- People
- Fellowships

Each content section supports:

- Create
- List
- Edit
- Delete

The form fields are normalized into a common UI shape:

```text
title
description
date
location
url
```

The backend maps those generic fields to the actual Supabase table columns.

### Records sections

The following sections use `RecordsManager`:

- Newsletter subscribers
- Contact messages
- Donations

These sections are read-only operational views at the moment. They read records from Supabase through `/api/admin/records`.

### Gallery and People uploads

The Gallery and People forms include an image upload input.

Upload flow:

1. Admin selects an image.
2. Browser sends the file as `multipart/form-data` to `/api/admin/upload`.
3. Server validates the admin cookie.
4. Server checks the file type and size.
5. Server uploads to Supabase Storage bucket `church-media`.
6. Server returns the public image URL.
7. Form stores the returned URL in the relevant Supabase row.

Current upload limits:

- Image files only
- Maximum size: 5 MB
- Bucket: `church-media`
- Storage path: `uploads/<uuid>.<extension>`

## 6. Supabase Database Schema

The schema is documented in `supabase/schema.sql`.

The project uses these tables:

### `events`

```text
id
 title
description
date
location
url
created_at
```

Used by the Events admin section and homepage Events section.

### `branches`

```text
id
name
location
service_times
contact_info
created_at
```

The application maps these fields as follows:

```text
name          -> title
contact_info  -> description
service_times -> date
location      -> location
```

Used by the Branches admin section and homepage Branches section.

### `sermons`

```text
id
title
description
date
preacher
youtube_url
created_at
```

Application mapping:

```text
title       -> title
description -> description
date        -> date
preacher    -> location
youtube_url  -> url
```

Used by the Sermons admin section and homepage Latest Sermon section.

### `gallery`

```text
id
title
url
description
created_at
```

Used by the Gallery admin section and homepage Gallery section.

### `people`

```text
id
name
role
bio
photo_url
created_at
```

Application mapping:

```text
name      -> title
role      -> location
bio       -> description
photo_url -> url
```

Used by the People admin section. Leadership profiles can be added here.

### `fellowships`

```text
id
name
day
time
location
description
created_at
```

Application mapping:

```text
name        -> title
day + time  -> date
location    -> location
description -> description
```

Used by the Fellowships admin section and homepage fellowship filter.

### `newsletter_subscribers`

```text
id
email
subscribed_at
```

The public newsletter form inserts or upserts a subscriber. The admin Newsletter section reads these records.

### `contact_messages`

```text
id
name
email
message
created_at
```

The public contact form stores messages here when Supabase is configured. The admin Messages section reads them.

### `donations`

```text
id
donor_name
amount
method
created_at
```

The admin Donations section reads this table. The current M-Pesa callback still needs to be completed so successful payments are written here.

### `admin_users`

```text
id
email
role
created_at
```

This table exists in the supplied schema but is not currently used by the custom admin login. The current admin login uses environment credentials instead.

## 7. Supabase Storage

The storage setup is in `supabase/storage.sql`.

Run it once in Supabase SQL Editor. It creates:

- Public bucket: `church-media`
- Public read policy for the bucket

The server uploads using `SUPABASE_SERVICE_ROLE_KEY`, which bypasses normal Storage RLS checks.

Never expose the service-role key in browser code.

## 8. Backend API Routes

### `POST /api/admin/login`

File: `src/app/api/admin/login/route.ts`

Purpose:

- Validates `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Sets the HTTP-only `church_admin` cookie

Response examples:

```json
{ "message": "Signed in" }
```

```json
{ "error": "Invalid credentials" }
```

Current limitation: this is a custom environment-based login, not full Supabase Auth.

### `DELETE /api/admin/login`

Clears the admin cookie.

### `GET /api/content`

Optional query:

```text
/api/content?type=events
```

Returns public content from Supabase. Supported types:

```text
events
branches
sermons
gallery
people
fellowships
```

### `POST /api/content`

Requires the admin cookie.

Creates a record in the matching Supabase table.

### `PATCH /api/content`

Requires the admin cookie.

Updates a record by UUID. The route searches the supported content tables for the matching ID.

### `DELETE /api/content?id=<uuid>`

Requires the admin cookie.

Deletes a content record.

### `GET /api/admin/records?table=<table>`

Requires the admin cookie.

Supported tables:

```text
newsletter_subscribers
contact_messages
donations
```

This route is for admin operational views and uses the server-side service-role client.

### `POST /api/admin/upload`

Requires the admin cookie.

Accepts a multipart form field named `file` and uploads the file to Supabase Storage.

### `POST /api/contact`

Validates name, email, and message.

If Supabase is configured, inserts into `contact_messages`. If Supabase is not configured, it can use `CONTACT_WEBHOOK_URL`.

### `POST /api/newsletter`

Validates email.

If Supabase is configured, upserts into `newsletter_subscribers`. If Supabase is not configured, it can use `NEWSLETTER_WEBHOOK_URL`.

### `POST /api/donations/mpesa`

Starts a Safaricom Daraja STK Push request.

Required values:

- `phone`
- `amount`
- Optional donor `name`

The route validates Kenyan phone numbers and amount limits, obtains a Daraja access token, and sends the STK request.

### `POST /api/donations/mpesa/callback`

Receives the Safaricom callback.

Current limitation: it logs and acknowledges the callback but does not yet persist or verify the transaction in `donations`. This must be completed before production payments are enabled.

## 9. Supabase Client Files

### `src/lib/supabase.ts`

Provides two server-side clients:

- `getSupabaseAdmin()` uses `SUPABASE_SERVICE_ROLE_KEY`
- `getSupabasePublic()` uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The admin client is server-only.

### `src/utils/supabase/server.ts`

Creates a Supabase SSR server client using Next.js cookies.

### `src/utils/supabase/client.ts`

Creates a browser Supabase client using `createBrowserClient`.

### `src/utils/supabase/middleware.ts`

Refreshes Supabase Auth sessions in middleware.

### `middleware.ts`

Calls the Supabase session update helper for application requests.

## 10. Environment Variables

The shareable template is `.env.example`.

The local secret file is `.env.local` and is ignored by Git.

Required values:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-long-random-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
```

M-Pesa values:

```env
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=https://your-domain.example/api/donations/mpesa/callback
```

Optional contact/newsletter fallback providers:

```env
CONTACT_WEBHOOK_URL=
NEWSLETTER_WEBHOOK_URL=
```

Security rules:

- Never commit `.env.local`.
- Never put `SUPABASE_SERVICE_ROLE_KEY` in client components.
- Never put the service-role key in `NEXT_PUBLIC_*` variables.
- Rotate any key that has been shared publicly.
- Use different admin and session secrets in production.

## 11. Local Development

Install dependencies:

```powershell
npm install
```

Start development mode:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
http://localhost:3000/admin/login
```

Admin credentials come from `.env.local`.

Build production output:

```powershell
npm run build
```

Run the built server:

```powershell
npm run start
```

There is no `npm run host` script in the project. Use `npm run dev` for local development or `npm run start` after building.

## 12. Supabase Setup Checklist

1. Create the Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Run `supabase/storage.sql` in Supabase SQL Editor.
4. Confirm the tables exist:
   - events
   - branches
   - sermons
   - gallery
   - people
   - fellowships
   - newsletter_subscribers
   - contact_messages
   - donations
   - admin_users
5. Confirm the `church-media` Storage bucket exists and is public for reads.
6. Add the project URL and public key to `.env.local`.
7. Add the service-role key to `.env.local`.
8. Restart Next.js after editing environment variables.
9. Log into `/admin/login`.
10. Create an event and verify it appears on the homepage.
11. Upload a Gallery image and verify the returned Storage URL works.
12. Submit a contact message and verify it appears in the admin Messages section.
13. Submit a newsletter email and verify it appears in Newsletter.

## 13. How Content Moves Through the System

### Events example

```text
Admin fills Events form
        |
        v
POST /api/content
        |
        v
content-store.ts maps the common form to events columns
        |
        v
Supabase events table
        |
        v
GET /api/content?type=events
        |
        v
Homepage eventItems state
        |
        v
Public Events section
```

### Gallery image example

```text
Admin selects image
        |
        v
POST /api/admin/upload
        |
        v
Supabase Storage church-media bucket
        |
        v
Public image URL returned
        |
        v
Admin saves Gallery record with URL
        |
        v
Supabase gallery table
        |
        v
Homepage galleryItems state
```

## 14. Known Production Gaps

These are the next tasks before calling the system fully production-ready.

### M-Pesa

The callback must:

- Parse the Safaricom callback structure.
- Verify the checkout request ID.
- Persist successful and failed payment results in `donations`.
- Prevent duplicate callback processing.
- Store receipt number, phone number, amount, result code, and timestamps.
- Give users a reliable payment status.
- Add an admin donation detail view.

### Messaging

The contact and newsletter routes currently store data in Supabase when configured. Add one of the following for notifications:

- Resend
- SendGrid
- Mailgun
- An SMTP provider
- A Supabase Edge Function

Do not send email directly from a client component.

### Security

Before deployment:

- Rotate all keys previously shared in chat or logs.
- Replace the custom static admin cookie with Supabase Auth or signed, rotating sessions.
- Add rate limiting to login, contact, newsletter, and donation routes.
- Add request size limits.
- Add audit logging for admin edits.
- Add role checks for admin, editor, and media team roles.
- Add monitoring and error reporting.

### Persistence

The local JSON fallback in `data/content.json` is useful for development only. Production must use Supabase and should fail clearly if the database is unavailable rather than silently writing to local disk.

### Testing

Add automated tests for:

- Admin login success/failure
- Unauthorized CRUD rejection
- Event create/edit/delete
- Branch field mapping
- Sermon YouTube URL mapping
- People bio/photo mapping
- Upload file type and size validation
- Contact validation
- Newsletter duplicate handling
- M-Pesa callback processing

## 15. Recommended Next Session Order

Follow this order in the next session:

1. Rotate the Supabase service-role key and update `.env.local`.
2. Run `schema.sql` and `storage.sql` in Supabase.
3. Confirm `church-media` exists.
4. Test admin login.
5. Add one Event from the dashboard.
6. Confirm the event appears on `/`.
7. Add one Branch and confirm the branch list updates.
8. Upload one Gallery image.
9. Confirm the image URL works publicly.
10. Submit a contact message.
11. Confirm it appears under Admin → Messages.
12. Submit a newsletter email.
13. Confirm it appears under Admin → Newsletter.
14. Finish M-Pesa callback persistence.
15. Add rate limiting and role-based authorization.
16. Deploy to Vercel with environment variables configured.
17. Run a production smoke test.

## 16. Deployment Checklist

Before deploying to Vercel or another Node-compatible host:

- [ ] Supabase schema has been run.
- [ ] Storage bucket has been created.
- [ ] RLS policies have been reviewed.
- [ ] Production environment variables are configured.
- [ ] Service-role key is stored as a server-only secret.
- [ ] Admin password and session secret are strong and rotated.
- [ ] M-Pesa callback URL points to the deployed domain.
- [ ] M-Pesa callback persistence is implemented.
- [ ] Contact/newsletter notification provider is configured.
- [ ] `npm run build` passes.
- [ ] `npm run lint` has no errors.
- [ ] Admin CRUD has been tested against production Supabase.
- [ ] Image upload has been tested.
- [ ] Mobile layout has been checked.
- [ ] Admin routes are protected.
- [ ] No secrets are committed.

## 17. Useful Files to Open First

For the public design:

- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`

For the admin dashboard:

- `src/app/admin/page.tsx`
- `src/app/admin/dashboard.tsx`
- `src/app/admin/content-manager.tsx`
- `src/app/admin/records-manager.tsx`

For backend behavior:

- `src/lib/content-store.ts`
- `src/lib/supabase.ts`
- `src/lib/validation.ts`
- `src/app/api/content/route.ts`

For Supabase:

- `supabase/schema.sql`
- `supabase/storage.sql`
- `src/utils/supabase/server.ts`
- `src/utils/supabase/client.ts`
- `src/utils/supabase/middleware.ts`
- `middleware.ts`

For payments:

- `src/app/api/donations/mpesa/route.ts`
- `src/app/api/donations/mpesa/callback/route.ts`

## 18. Working Principle

The intended architecture is:

```text
Supabase is the source of truth.

Admin dashboard -> protected API routes -> Supabase tables/storage
Public website  -> public API reads        -> Supabase tables/storage
Payments        -> Daraja API              -> verified callback -> donations table
Messages        -> contact/newsletter API -> Supabase + notification provider
```

Any future feature should preserve this direction. Do not add new hardcoded public data when the same content belongs in Supabase. Add or update the table mapping, API route, admin form, and public rendering together.
