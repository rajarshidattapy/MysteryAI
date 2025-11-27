-- Enable pgvector extension for vector embeddings
create extension if not exists vector;

-- Create users table (extends auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  username text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  stats jsonb default '{"gamesPlayed": 0, "wins": 0, "totalSolveTime": 0}'::jsonb
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create policies for users
create policy "Users can view their own profile"
  on public.users for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.users for update
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on public.users for insert
  with check ( auth.uid() = id );

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, email, created_at, stats)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    now(),
    '{"gamesPlayed": 0, "wins": 0, "totalSolveTime": 0}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create cases table
create table public.cases (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references public.users(id),
  case_title text,
  case_overview text,
  difficulty text,
  suspects jsonb,
  witnesses jsonb,
  user_guess text,
  guess_correct boolean,
  solved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  embedding vector(384) -- Assuming 384 dim embedding
);

-- Enable RLS for cases
alter table public.cases enable row level security;

-- Create policies for cases
create policy "Users can view their own cases"
  on public.cases for select
  using ( auth.uid() = created_by );

create policy "Users can insert their own cases"
  on public.cases for insert
  with check ( auth.uid() = created_by );

create policy "Users can update their own cases"
  on public.cases for update
  using ( auth.uid() = created_by );

-- Create games table (for stats)
create table public.games (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id),
  case_id uuid references public.cases(id),
  case_title text,
  solved boolean,
  time_taken integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for games
alter table public.games enable row level security;

-- Create policies for games
create policy "Users can view their own games"
  on public.games for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own games"
  on public.games for insert
  with check ( auth.uid() = user_id );

-- Create embeddings table (if needed separately)
create table public.embeddings (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id),
  role text,
  name text,
  field text,
  text text,
  embedding vector(384)
);

-- Enable RLS for embeddings
alter table public.embeddings enable row level security;

create policy "Users can view embeddings for their cases"
  on public.embeddings for select
  using ( exists ( select 1 from public.cases where id = embeddings.case_id and created_by = auth.uid() ) );

create policy "Users can insert embeddings for their cases"
  on public.embeddings for insert
  with check ( exists ( select 1 from public.cases where id = embeddings.case_id and created_by = auth.uid() ) );
