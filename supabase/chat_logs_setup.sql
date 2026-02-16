-- Chat logs table
create table if not exists chat_logs (
  id bigint primary key generated always as identity,
  hospital_id text not null references hospitals(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default now()
);

create index if not exists idx_chat_logs_hospital_id on chat_logs(hospital_id);
create index if not exists idx_chat_logs_user_id on chat_logs(user_id);
create index if not exists idx_chat_logs_created_at on chat_logs(created_at desc);

alter table chat_logs enable row level security;

drop policy if exists "Allow anonymous insert" on chat_logs;
drop policy if exists "Allow select for admins" on chat_logs;
drop policy if exists "Allow authenticated own inserts" on chat_logs;
drop policy if exists "Allow authenticated own reads" on chat_logs;

create policy "Allow authenticated own inserts"
on chat_logs for insert
to authenticated
with check (user_id = auth.uid() or user_id is null);

create policy "Allow authenticated own reads"
on chat_logs for select
to authenticated
using (user_id = auth.uid());
