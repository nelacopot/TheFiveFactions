# Supabase development setup

The database schema is managed with timestamped SQL files in `migrations/`. A fresh `npx supabase start` applies the migrations and seed data. `npx supabase db reset` reapplies everything and deletes local database data, so use it only when a reset is intended.

New signups receive the `Member` role automatically. To promote your first local account, sign up once, open the local Supabase Studio SQL editor, replace the email below with your own, and run this once:

```sql
insert into public.user_roles (user_id, role_id, assigned_by)
select p.id, r.id, p.id
from public.profiles p
join auth.users u on u.id = p.id
join public.roles r on r.name = 'Administrator'
where u.email = 'your-local-account@example.com'
on conflict (user_id, role_id) do nothing;
```

This is only for bootstrapping a local development account. Future role changes should go through the application's administrator workflow.

Signup confirmation emails in local development are captured by Mailpit at `http://127.0.0.1:54324`; they are not delivered to real inboxes. The confirmation link verifies its token through `/auth/confirm` and establishes the server-side session cookie. For a hosted environment, configure a real SMTP provider and the correct Auth Site URL in Supabase.

Application notifications use `SMTP_URL` and `SMTP_FROM` in `frontend/.env.local`. Local SMTP is exposed on `127.0.0.1:54325` and also captured by Mailpit at `http://127.0.0.1:54324`. Set `SUPABASE_SERVICE_ROLE_KEY` and a private `NOTIFICATION_CRON_SECRET` for the dispatcher. A hosted scheduler should POST to `/api/notifications/dispatch` every few minutes with `Authorization: Bearer <NOTIFICATION_CRON_SECRET>`. The signed-in dashboard also dispatches the current user's queued mail while it is open. For production, use the SMTP URL and sender address from the chosen mail provider; never expose the service role key or cron secret to the browser.
