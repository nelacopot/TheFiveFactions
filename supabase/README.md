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
