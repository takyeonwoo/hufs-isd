-- =====================================================================
-- Foorendy MVP — 전체 스키마 (9개 테이블, FK 11개)
-- Supabase SQL Editor에 그대로 붙여넣어 한 번에 실행
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. owners (사장님 · Supabase Auth)
-- ---------------------------------------------------------------------
create table owners (
    owner_id    uuid primary key references auth.users (id) on delete cascade,
    email       text,
    created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. admin (심사자 · Supabase Auth)
-- ---------------------------------------------------------------------
create table admin (
    admin_id    uuid primary key references auth.users (id) on delete cascade,
    email       text,
    created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. stores
-- ---------------------------------------------------------------------
create table stores (
    store_id         bigint generated always as identity primary key,
    owner_id         uuid not null references owners (owner_id) on delete cascade,
    name             text not null,
    address          text,
    latitude         double precision,
    longitude        double precision,
    phone            text,
    business_reg_no  text,
    naver_place_url  text,
    created_at       timestamptz not null default now()
);
create index idx_stores_owner_id on stores (owner_id);

-- ---------------------------------------------------------------------
-- 4. trends (= food_trends)
-- ---------------------------------------------------------------------
create table trends (
    trend_id          bigint generated always as identity primary key,
    name              text not null,
    trend_score       numeric,
    rank              int,
    previous_rank     int,
    score_change_pct  numeric,
    status            text check (status in ('HOT', 'RISING', 'FALLING')),
    updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. products (재고 포함)
-- ---------------------------------------------------------------------
create table products (
    product_id        bigint generated always as identity primary key,
    store_id          bigint not null references stores (store_id) on delete cascade,
    trend_id          bigint not null references trends (trend_id) on delete cascade,
    name              text not null,
    price             int,
    quantity          int not null default 0,
    stock_status      text check (stock_status in ('AVAILABLE', 'LOW', 'SOLD_OUT')),
    stock_updated_at  timestamptz,
    image_url         text,
    created_at        timestamptz not null default now()
);
create index idx_products_store_id on products (store_id);
create index idx_products_trend_id on products (trend_id);

-- ---------------------------------------------------------------------
-- 6. inventory_logs (재고 변경 이력)
-- ---------------------------------------------------------------------
create table inventory_logs (
    log_id        bigint generated always as identity primary key,
    product_id    bigint not null references products (product_id) on delete cascade,
    old_quantity  int,
    new_quantity  int,
    updated_at    timestamptz not null default now()
);
create index idx_inventory_logs_product_id on inventory_logs (product_id);

-- ---------------------------------------------------------------------
-- 7. analytics_logs (손님 익명 로그)
-- ---------------------------------------------------------------------
create table analytics_logs (
    log_id      bigint generated always as identity primary key,
    visitor_id  text,
    store_id    bigint references stores (store_id) on delete set null,
    product_id  bigint references products (product_id) on delete set null,
    trend_id    bigint references trends (trend_id) on delete set null,
    event_type  text check (event_type in ('VIEW_STORE', 'SEARCH_TREND', 'CLICK_MARKER')),
    created_at  timestamptz not null default now()
);
create index idx_analytics_logs_store_id on analytics_logs (store_id);
create index idx_analytics_logs_product_id on analytics_logs (product_id);
create index idx_analytics_logs_trend_id on analytics_logs (trend_id);

-- ---------------------------------------------------------------------
-- 8. store_notices (공지)
-- ---------------------------------------------------------------------
create table store_notices (
    notice_id   bigint generated always as identity primary key,
    store_id    bigint not null references stores (store_id) on delete cascade,
    content     text,
    status      text check (status in ('PUBLISHED', 'DRAFT')),
    expires_at  timestamptz,
    created_at  timestamptz not null default now()
);
create index idx_store_notices_store_id on store_notices (store_id);

-- ---------------------------------------------------------------------
-- 9. store_applications (입점 신청)
-- ---------------------------------------------------------------------
create table store_applications (
    application_id       bigint generated always as identity primary key,
    applicant_id         uuid not null references owners (owner_id) on delete cascade,
    applicant_name       text,
    cafe_name            text,
    address              text,
    phone                text,
    business_reg_no      text,
    business_license_url text,
    naver_place_url      text,
    terms_agreed_at      timestamptz not null,
    marketing_agreed     boolean default false,
    status               text not null default 'PENDING'
                              check (status in ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason     text,
    store_id             bigint references stores (store_id) on delete set null,
    reviewed_by          uuid references admin (admin_id) on delete set null,
    submitted_at         timestamptz not null default now(),
    reviewed_at          timestamptz
);
create index idx_store_applications_applicant_id on store_applications (applicant_id);
create index idx_store_applications_store_id on store_applications (store_id);
create index idx_store_applications_reviewed_by on store_applications (reviewed_by);

commit;
