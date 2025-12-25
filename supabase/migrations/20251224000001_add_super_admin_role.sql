-- Add super_admin role to the profiles role constraint
-- First, update the constraint by dropping and recreating
alter table profiles drop constraint profiles_role_check;

alter table profiles add constraint profiles_role_check check (role in ('admin', 'super_admin', 'volunteer'));
