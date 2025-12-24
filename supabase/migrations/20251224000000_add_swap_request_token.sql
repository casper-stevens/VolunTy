-- Add share token to swap_requests for public shareable links
alter table swap_requests add column share_token text unique;

-- Create index for faster lookups
create index idx_swap_requests_share_token on swap_requests(share_token);
