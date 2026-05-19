# Personal Transfer App

A simple private web app for moving text memos and files between a Windows PC and an iPad through the internet. It uses Next.js, Supabase Postgres, Supabase Storage, and Vercel.

## Features

- One-user password protection
- Save text memos
- Upload files
- List saved memos and files
- Copy memo text
- Download files
- Delete memos and files
- Shows upload date and file size
- Mobile-friendly layout for iPad

## 1. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com).
2. Open **SQL Editor** and run this SQL:

```sql
create table public.memos (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  path text not null unique,
  size bigint not null,
  mime_type text,
  created_at timestamptz not null default now()
);
```

3. Open **Storage** and create a private bucket named:

```text
transfer-files
```

4. Open **Project Settings > API** and copy:

- Project URL
- `service_role` key

Keep the service role key secret. Do not expose it in browser code.

## 2. Local Setup

Create `.env.local` from `.env.example`:

```env
APP_PASSWORD=your-private-password
SESSION_SECRET=use-a-long-random-string-here
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=transfer-files
```

Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 3. Vercel Deployment

1. Push this project to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. In **Project Settings > Environment Variables**, add:

```text
APP_PASSWORD
SESSION_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_BUCKET
```

4. Deploy.
5. Open the Vercel URL on both your Windows PC and iPad.

## Notes

- This app intentionally has no user registration.
- Supabase tables do not need public access because the app uses the service role key only on server routes.
- Anyone with the app password can access the app, so use a strong password and keep your Vercel environment variables private.
