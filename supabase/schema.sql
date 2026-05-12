-- VAT Invoicing SaaS — multi-tenant schema
-- Run in the Supabase SQL editor on a fresh project.
-- All tables enforce org-level isolation via RLS.

create extension if not exists "uuid-ossp";

-- ---------- organizations ----------
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  legal_name text,
  vat_number text,
  cr_number text,
  email text,
  phone text,
  address_line text,
  city text,
  country text default 'Saudi Arabia',
  currency text not null default 'SAR',
  vat_rate numeric(5,2) not null default 15.00,
  invoice_prefix text not null default 'INV',
  invoice_counter integer not null default 0,
  logo_url text,
  zatca_qr_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- memberships ----------
create table if not exists public.memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  unique (user_id, organization_id)
);

create index if not exists memberships_user_idx on public.memberships(user_id);
create index if not exists memberships_org_idx on public.memberships(organization_id);

-- ---------- products ----------
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sku text,
  name text not null,
  name_ar text,
  description text,
  unit_price numeric(14,2) not null default 0,
  stock_qty numeric(14,2) not null default 0,
  unit text not null default 'unit',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_org_idx on public.products(organization_id);

-- ---------- customers ----------
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  name_ar text,
  vat_number text,
  email text,
  phone text,
  address_line text,
  city text,
  country text default 'Saudi Arabia',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_org_idx on public.customers(organization_id);

-- ---------- invoices ----------
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  invoice_number text not null,
  issue_date date not null default current_date,
  due_date date,
  status text not null default 'draft' check (status in ('draft','sent','paid','void')),
  currency text not null default 'SAR',
  notes text,
  subtotal numeric(14,2) not null default 0,
  vat_total numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  vat_rate numeric(5,2) not null default 15.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, invoice_number)
);

create index if not exists invoices_org_idx on public.invoices(organization_id);
create index if not exists invoices_customer_idx on public.invoices(customer_id);
create index if not exists invoices_issue_date_idx on public.invoices(issue_date);

-- ---------- invoice items ----------
create table if not exists public.invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  description_ar text,
  quantity numeric(14,2) not null default 1,
  unit_price numeric(14,2) not null default 0,
  line_subtotal numeric(14,2) not null default 0,
  line_vat numeric(14,2) not null default 0,
  line_total numeric(14,2) not null default 0,
  position integer not null default 0
);

create index if not exists invoice_items_invoice_idx on public.invoice_items(invoice_id);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_org_updated on public.organizations;
create trigger trg_org_updated before update on public.organizations
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_customers_updated on public.customers;
create trigger trg_customers_updated before update on public.customers
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_invoices_updated on public.invoices;
create trigger trg_invoices_updated before update on public.invoices
  for each row execute procedure public.set_updated_at();

-- ---------- invoice number sequence ----------
create or replace function public.next_invoice_number(p_org uuid)
returns text language plpgsql security definer as $$
declare
  v_prefix text;
  v_counter integer;
begin
  update public.organizations
    set invoice_counter = invoice_counter + 1
    where id = p_org
    returning invoice_prefix, invoice_counter into v_prefix, v_counter;
  if v_prefix is null then
    raise exception 'Organization not found';
  end if;
  return v_prefix || '-' || to_char(now(), 'YYYY') || '-' || lpad(v_counter::text, 5, '0');
end $$;

-- ---------- RLS ----------
alter table public.organizations enable row level security;
alter table public.memberships  enable row level security;
alter table public.products     enable row level security;
alter table public.customers    enable row level security;
alter table public.invoices     enable row level security;
alter table public.invoice_items enable row level security;

-- helper: organizations the current user belongs to
create or replace function public.user_is_member(p_org uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.memberships
    where organization_id = p_org and user_id = auth.uid()
  );
$$;

-- organizations: members can read; only members can update; any authed user can insert
drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations for select
  using (public.user_is_member(id));

drop policy if exists org_insert on public.organizations;
create policy org_insert on public.organizations for insert
  with check (auth.uid() is not null);

drop policy if exists org_update on public.organizations;
create policy org_update on public.organizations for update
  using (public.user_is_member(id))
  with check (public.user_is_member(id));

-- memberships: a user sees their own memberships; can insert their own only
drop policy if exists membership_select on public.memberships;
create policy membership_select on public.memberships for select
  using (user_id = auth.uid() or public.user_is_member(organization_id));

drop policy if exists membership_insert on public.memberships;
create policy membership_insert on public.memberships for insert
  with check (user_id = auth.uid());

-- products / customers / invoices: all by org membership
drop policy if exists products_all on public.products;
create policy products_all on public.products for all
  using (public.user_is_member(organization_id))
  with check (public.user_is_member(organization_id));

drop policy if exists customers_all on public.customers;
create policy customers_all on public.customers for all
  using (public.user_is_member(organization_id))
  with check (public.user_is_member(organization_id));

drop policy if exists invoices_all on public.invoices;
create policy invoices_all on public.invoices for all
  using (public.user_is_member(organization_id))
  with check (public.user_is_member(organization_id));

drop policy if exists invoice_items_all on public.invoice_items;
create policy invoice_items_all on public.invoice_items for all
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and public.user_is_member(i.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and public.user_is_member(i.organization_id)
    )
  );
