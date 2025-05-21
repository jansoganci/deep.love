-- profiles table with extended fields for better matching
create table profiles (
  id uuid primary key references auth.users,
  display_name text,
  avatar_url text,
  bio text,
  age integer,
  occupation text,
  interests text[],
  relationship_goal text,
  gender text,
  religion text,
  ethnicity text,
  height integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security (RLS) for profiles
alter table profiles enable row level security;

-- Policy: Users can view any profile
create policy "Anyone can view profiles"
  on profiles for select
  using (true);

-- Policy: Users can update their own profile only
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Policy: Users can insert their own profile only
create policy "Users can insert their own profile"
  on profiles for insert
  using (auth.uid() = id);

-- swipes table (records swipe actions)
create table swipes (
  id bigint generated always as identity primary key,
  from_id uuid references auth.users,
  to_id uuid,
  direction text check (direction in ('left', 'right')),
  created_at timestamptz default now()
);

-- Row Level Security (RLS) for swipes
alter table swipes enable row level security;

-- Policy: Users can view their own swipes
create policy "Users can view their own swipes"
  on swipes for select
  using (auth.uid() = from_id);

-- Policy: Users can insert their own swipes only
create policy "Users can insert their own swipes"
  on swipes for insert
  using (auth.uid() = from_id);

-- matches view (finds mutual right swipes - matches)
create or replace view matches as
select 
  a.from_id as user_a,
  a.to_id as user_b,
  a.created_at,
  p1.display_name as user_a_name,
  p2.display_name as user_b_name,
  p1.avatar_url as user_a_avatar,
  p2.avatar_url as user_b_avatar
from swipes a
join swipes b
  on a.from_id = b.to_id
  and a.to_id = b.from_id
  and a.direction = 'right'
  and b.direction = 'right'
left join profiles p1 on a.from_id = p1.id
left join profiles p2 on a.to_id = p2.id;

-- Trigger to update the updated_at timestamp
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
before update on profiles
for each row
execute procedure update_modified_column();