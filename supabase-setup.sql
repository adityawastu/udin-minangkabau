-- Jalankan SATU KALI di SQL Editor proyek Supabase untuk undangan ini.
-- Jika invitation_comments sudah ada, hentikan dan periksa skemanya dahulu.
begin;

create table public.invitation_comments (
  id uuid primary key default gen_random_uuid(),
  nama text not null check (char_length(btrim(nama)) between 1 and 100),
  ucapan text not null check (char_length(btrim(ucapan)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index invitation_comments_created_idx
  on public.invitation_comments (created_at desc, id desc);

alter table public.invitation_comments enable row level security;
revoke all on table public.invitation_comments from public, anon, authenticated;
grant usage on schema public to anon;
grant select on table public.invitation_comments to anon;
-- Tamu hanya boleh mengisi nama dan ucapan. ID dan tanggal diisi database.
grant insert (nama, ucapan) on public.invitation_comments to anon;

create policy "Pengunjung membaca ucapan"
  on public.invitation_comments for select to anon using (true);
create policy "Pengunjung mengirim ucapan"
  on public.invitation_comments for insert to anon
  with check (
    char_length(btrim(nama)) between 1 and 100
    and char_length(btrim(ucapan)) between 1 and 1000
  );

-- Tidak ada izin UPDATE/DELETE untuk pengunjung.
-- Pemilik dapat menghapus ucapan melalui Table Editor di dashboard Supabase.
commit;
