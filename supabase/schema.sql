-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Surveys Table
create table public.surveys (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Questions Table
create table public.questions (
  id uuid primary key default uuid_generate_v4(),
  survey_id uuid references public.surveys(id) on delete cascade not null,
  text text not null,
  type text not null check (type in ('choice', 'rating', 'text', 'yes_no')),
  "order" integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Options Table
create table public.options (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid references public.questions(id) on delete cascade not null,
  label text not null,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Sessions Table (State machine tracking user position in survey)
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  phone_number text not null,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  current_question_index integer not null default 1,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- 5. Responses Table (Individual submission header)
create table public.responses (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  phone_number text not null,
  completed boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Answers Table (Each recorded answer for a question)
create table public.answers (
  id uuid primary key default uuid_generate_v4(),
  response_id uuid references public.responses(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  option_id uuid references public.options(id) on delete cascade,
  text_answer text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for lightning fast lookups
create index idx_sessions_phone on public.sessions(phone_number, completed_at);
create index idx_questions_survey on public.questions(survey_id, "order");
create index idx_responses_survey on public.responses(survey_id);
create index idx_answers_response on public.answers(response_id);

-- Enable Row Level Security (RLS)
alter table public.surveys enable row level security;
alter table public.questions enable row level security;
alter table public.options enable row level security;
alter table public.sessions enable row level security;
alter table public.responses enable row level security;
alter table public.answers enable row level security;

-- Public read access policies for service role API
create policy "Allow all service role operations" on public.surveys for all using (true);
create policy "Allow all service role operations" on public.questions for all using (true);
create policy "Allow all service role operations" on public.options for all using (true);
create policy "Allow all service role operations" on public.sessions for all using (true);
create policy "Allow all service role operations" on public.responses for all using (true);
create policy "Allow all service role operations" on public.answers for all using (true);
