-- Per-user Higgsfield API credentials (RLS on profiles applies).

alter table public.profiles
  add column if not exists higgsfield_key_id text,
  add column if not exists higgsfield_key_secret text;

alter table public.profiles
  drop constraint if exists profiles_higgsfield_key_pair_check;

alter table public.profiles
  add constraint profiles_higgsfield_key_pair_check
  check (
    (higgsfield_key_id is null and higgsfield_key_secret is null)
    or (
      higgsfield_key_id is not null
      and higgsfield_key_secret is not null
      and char_length(higgsfield_key_id) between 1 and 512
      and char_length(higgsfield_key_secret) between 1 and 512
    )
  );
