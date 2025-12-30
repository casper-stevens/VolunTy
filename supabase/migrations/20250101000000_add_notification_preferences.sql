-- Create table for granular user notification preferences
create table user_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_minutes_before int default 1440,
  timezone text default 'UTC',
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Enable RLS
alter table user_notification_preferences enable row level security;

-- RLS Policies
create policy "Users can read own notification preferences" on user_notification_preferences
  for select using (auth.uid() = user_id);

create policy "Users can insert own notification preferences" on user_notification_preferences
  for insert with check (auth.uid() = user_id);

create policy "Users can update own notification preferences" on user_notification_preferences
  for update using (auth.uid() = user_id);

-- Create index for faster lookups
create index idx_user_notification_preferences_user_id on user_notification_preferences(user_id);
