-- profiles table
create table profiles (
  id uuid primary key references auth.users,
  display_name text,
  avatar_url text
);

-- swipes table
create table swipes (
  id bigint generated always as identity primary key,
  from_id uuid references auth.users,
  to_id uuid,
  direction text,
  created_at timestamptz default now()
);

-- matches view
create view matches as
select a.from_id as user_a,
       a.to_id as user_b,
       a.created_at
from swipes a
join swipes b
  on a.from_id = b.to_id
 and a.to_id = b.from_id
 and a.direction = 'right'
 and b.direction = 'right';