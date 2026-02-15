
-- 대화 기록을 저장할 테이블
create table if not exists chat_logs (
  id bigint primary key generated always as identity,
  hospital_id text not null references hospitals(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, -- 로그인 유저 ID (없으면 비회원)
  session_id text, -- 익명 사용자 구분을 위한 세션 ID
  role text not null check (role in ('user', 'assistant')), -- 'user' or 'assistant'
  content text not null,
  created_at timestamp with time zone default now()
);

-- 최신 순으로 조회하기 위한 인덱스
create index if not exists idx_chat_logs_hospital_id on chat_logs(hospital_id);
create index if not exists idx_chat_logs_user_id on chat_logs(user_id);
create index if not exists idx_chat_logs_created_at on chat_logs(created_at desc);

-- RLS (Row Level Security) 설정: 
-- 1. 누구나 insert 가능 (질문 저장)
-- 2. select는 병원 관리자만 가능하도록 (추후 고도화 필요, 현재는 개발 편의상 public open or service_role only)
alter table chat_logs enable row level security;

create policy "Allow anonymous insert"
on chat_logs for insert
with check (true);

create policy "Allow select for admins"
on chat_logs for select
using (true); -- 일단 테스트를 위해 모두 허용, 추후 auth.uid() 체크로 변경 추천
