-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  total_likes_received int default 0,
  total_topics int default 0,
  total_answers int default 0,
  created_at timestamptz default now()
);

-- Topics (上の句)
create table topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  kami_no_ku text not null,
  description text,
  status text default 'open' check (status in ('open', 'closed')),
  closes_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

-- Answers (中の句 + 下の句)
create table answers (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  naka_no_ku text not null,
  shimo_no_ku text not null,
  likes_count int default 0,
  is_hidden boolean default false,
  report_count int default 0,
  created_at timestamptz default now()
);

-- Likes
create table likes (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid references answers(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(answer_id, user_id)
);

-- Reports
create table reports (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid references answers(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  reason text,
  created_at timestamptz default now(),
  unique(answer_id, user_id)
);

-- Badges master
create table badges (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null
);

-- User badges
create table user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  badge_id text references badges(id) not null,
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

-- Initial badge data
insert into badges (id, name, description, icon) values
  ('debut', '川柳デビュー', '初めての投稿', '🌸'),
  ('answer10', '答え上手', '回答を10回投稿', '✍️'),
  ('likes10', 'いいね10', 'いいねを10個獲得', '❤️'),
  ('likes50', 'いいね50', 'いいねを50個獲得', '💖'),
  ('champion', '殿堂句師', 'お題で1位を獲得', '🏆'),
  ('prolific', '多作川人', '累計50回答を投稿', '📝');

-- Function: increment likes_count on answer and total_likes_received on profile
create or replace function handle_like_insert()
returns trigger language plpgsql security definer as $$
begin
  update answers set likes_count = likes_count + 1 where id = new.answer_id;
  update profiles set total_likes_received = total_likes_received + 1
    where id = (select user_id from answers where id = new.answer_id);
  return new;
end;
$$;

create trigger on_like_insert
  after insert on likes
  for each row execute procedure handle_like_insert();

-- Function: decrement on unlike
create or replace function handle_like_delete()
returns trigger language plpgsql security definer as $$
begin
  update answers set likes_count = greatest(0, likes_count - 1) where id = old.answer_id;
  update profiles set total_likes_received = greatest(0, total_likes_received - 1)
    where id = (select user_id from answers where id = old.answer_id);
  return old;
end;
$$;

create trigger on_like_delete
  after delete on likes
  for each row execute procedure handle_like_delete();

-- Function: hide answer when report_count >= 3
create or replace function handle_report_insert()
returns trigger language plpgsql security definer as $$
begin
  update answers set report_count = report_count + 1 where id = new.answer_id;
  update answers set is_hidden = true where id = new.answer_id and report_count >= 3;
  return new;
end;
$$;

create trigger on_report_insert
  after insert on reports
  for each row execute procedure handle_report_insert();

-- Function: auto-close topics past closes_at
create or replace function close_expired_topics()
returns void language plpgsql security definer as $$
begin
  update topics set status = 'closed'
  where status = 'open' and closes_at < now();
end;
$$;

-- Helper functions for incrementing profile stats
create or replace function increment_total_topics(uid uuid)
returns void language plpgsql security definer as $$
begin
  update profiles set total_topics = total_topics + 1 where id = uid;
end;
$$;

create or replace function increment_total_answers(uid uuid)
returns void language plpgsql security definer as $$
begin
  update profiles set total_answers = total_answers + 1 where id = uid;
end;
$$;

-- RLS
alter table profiles enable row level security;
alter table topics enable row level security;
alter table answers enable row level security;
alter table likes enable row level security;
alter table reports enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;

-- profiles policies
create policy "profiles are viewable by everyone" on profiles for select using (true);
create policy "users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "users can update own profile" on profiles for update using (auth.uid() = id);

-- topics policies
create policy "topics are viewable by everyone" on topics for select using (true);
create policy "authenticated users can insert topics" on topics for insert with check (auth.uid() = user_id);
create policy "users can update own topics" on topics for update using (auth.uid() = user_id);

-- answers policies
create policy "non-hidden answers viewable by everyone" on answers for select using (is_hidden = false or auth.uid() = user_id);
create policy "authenticated users can insert answers" on answers for insert with check (auth.uid() = user_id);
create policy "users can update own answers" on answers for update using (auth.uid() = user_id);

-- likes policies
create policy "likes are viewable by everyone" on likes for select using (true);
create policy "authenticated users can like" on likes for insert with check (auth.uid() = user_id);
create policy "users can unlike own likes" on likes for delete using (auth.uid() = user_id);

-- reports policies
create policy "authenticated users can report" on reports for insert with check (auth.uid() = user_id);
create policy "users can view own reports" on reports for select using (auth.uid() = user_id);

-- badges policies
create policy "badges are viewable by everyone" on badges for select using (true);

-- user_badges policies
create policy "user_badges are viewable by everyone" on user_badges for select using (true);
create policy "system can insert user_badges" on user_badges for insert with check (auth.uid() = user_id);

-- Trigger: create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
