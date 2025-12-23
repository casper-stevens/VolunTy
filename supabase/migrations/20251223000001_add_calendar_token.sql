-- Add calendar_token to profiles for iCalendar feed subscriptions
alter table profiles add column calendar_token text unique;

-- Create an index for faster lookups by token
create index idx_profiles_calendar_token on profiles(calendar_token);

-- Function to generate a unique calendar token
create or replace function generate_calendar_token()
returns text as $$
declare
  token text;
begin
  loop
    token := encode(gen_random_bytes(32), 'hex');
    exit when not exists (select 1 from profiles where calendar_token = token);
  end loop;
  return token;
end;
$$ language plpgsql;

-- Populate calendar tokens for existing users
update profiles
set calendar_token = generate_calendar_token()
where calendar_token is null;

-- Make calendar_token not null going forward
alter table profiles alter column calendar_token set not null;

-- Create a trigger to auto-generate tokens for new users
create or replace function set_calendar_token()
returns trigger as $$
begin
  if new.calendar_token is null then
    new.calendar_token := generate_calendar_token();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_calendar_token
  before insert on profiles
  for each row execute procedure set_calendar_token();
