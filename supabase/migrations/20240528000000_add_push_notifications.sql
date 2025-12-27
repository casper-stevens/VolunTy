-- Add push notification columns to user_preferences table
alter table user_preferences
add column if not exists push_notifications_enabled boolean default false,
add column if not exists push_subscription jsonb,
add column if not exists updated_at timestamptz default now();

-- Create or update the RLS policy for user_preferences
create policy "Users can read own preferences" on user_preferences
  for select using (auth.uid() = user_id);

create policy "Users can update own preferences" on user_preferences
  for update using (auth.uid() = user_id);

create policy "Users can insert own preferences" on user_preferences
  for insert with check (auth.uid() = user_id);
