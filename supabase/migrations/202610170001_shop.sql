-- Apply with Supabase CLI or SQL editor. No passwords, provider tokens, or service keys here.
create table public.products (
  id text primary key,
  name text not null,
  price_qar numeric(10,2) not null check (price_qar > 0),
  approved boolean not null default false,
  active boolean not null default true
);
insert into public.products (id,name,price_qar,approved) values
 ('heart-keychain','A little love',15,true),
 ('capsule-keychain','The everyday tag',15,true),
 ('flower-keychain','Pocket bloom',15,true),
 ('hex-keychain','The little hex',15,true),
 ('ribbed-planter','A place to grow',40,false),
 ('phone-stand','Take a little stand',30,false),
 ('henna-stencil','Custom henna stencil',25,false),
 ('lithophane-small','Lithophane 10 × 15 cm',65,false),
 ('lithophane-medium','Lithophane 12 × 16 cm',85,false),
 ('lithophane-large','Lithophane 14 × 17 cm',110,false),
 ('led-base','LED base',25,false);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  request_id uuid not null,
  customer_name text not null check (length(customer_name) between 1 and 100),
  customer_phone text not null,
  fulfilment text not null default 'pickup' check (fulfilment = 'pickup'),
  status text not null default 'pending' check (status in ('pending','paid','failed','processing','ready','cancelled')),
  checkout_state text not null default 'creating' check (checkout_state in ('creating','ready','error')),
  total_qar numeric(10,2) not null check (total_qar > 0),
  currency text not null default 'QAR' check (currency = 'QAR'),
  items jsonb not null,
  gateway_invoice_id text,
  payment_url text,
  created_at timestamptz not null default now(),
  unique(user_id,request_id),
  unique(gateway_invoice_id)
);
create index orders_user_date on public.orders(user_id,created_at desc);
alter table public.products enable row level security;
alter table public.orders enable row level security;
create policy "Read active products" on public.products for select to anon,authenticated using (active);
create policy "Read own orders" on public.orders for select to authenticated using (auth.uid() = user_id);
-- Orders and payment status may only be written by the server, never by a customer.
revoke all on public.orders from anon,authenticated;
grant select(id,user_id,status,total_qar,currency,items,fulfilment,created_at) on public.orders to authenticated;
grant select on public.products to anon,authenticated;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('customer-designs','customer-designs',false,10485760,array['image/jpeg']);
create policy "Upload own photos" on storage.objects for insert to authenticated with check (
 bucket_id = 'customer-designs' and (storage.foldername(name))[1] = (select auth.uid()::text)
);
create policy "Read own photos" on storage.objects for select to authenticated using (
 bucket_id = 'customer-designs' and (storage.foldername(name))[1] = (select auth.uid()::text)
);
-- No public asset URLs and no customer access to manufacturing models.
