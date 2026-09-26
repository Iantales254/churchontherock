# Church on the Rock

Next.js website and admin dashboard for Church on the Rock in Nango, Kenya.

## Start Here

Read [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) for the complete architecture, database mappings, admin workflows, Supabase setup, deployment checklist, and next-session plan.

## Commands

```powershell
npm install
npm run dev
npm run build
npm run lint
npm run start
```

Local URLs:

- Public website: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Environment

Copy the values from `.env.example` into a local `.env.local` file and configure the Supabase, admin, messaging, and M-Pesa values. Never commit `.env.local` or expose the Supabase service-role key in browser code.
