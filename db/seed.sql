-- =====================================================================
-- Foorendy — 시드 데이터 (전체)
-- Supabase SQL Editor 에 붙여넣고 Run.
-- 다시 깔끔히 지우려면 reset_seed.sql 실행.
--
-- ⚠️ 실행 순서: schema.sql → seed.sql
-- ⚠️ 재실행 시 반드시 reset_seed.sql 을 먼저 돌릴 것. (안 그러면 stores/trends 중복)
-- ⚠️ owners/admin 은 auth.users 를 FK 로 물고 있어서, DEV 가짜 유저를
--    auth.users 에 먼저 심는다. 이 UUID 는 백엔드 DEV_FAKE_AUTH 의
--    DEV_OWNER_ID / DEV_ADMIN_ID (deps.py) 와 동일 → 가짜 로그인 사장님이
--    '연남 우베하우스'(reset 직후 store_id=1) 의 주인이 되어 대시보드가 바로 붙는다.
-- ⚠️ 모든 FK 는 이름(매장명/트렌드명)으로 조회 → identity 카운터 값에 무관.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 0. DEV 인증 유저 (auth.users) — FK 충족용
--    실제 소셜 로그인 유저는 아니고, DEV_FAKE_AUTH / 시드 전용.
-- ---------------------------------------------------------------------
insert into auth.users (instance_id, id, aud, role, email, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a1',
   'authenticated', 'authenticated', 'dev@foorendy.local',   now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a3',
   'authenticated', 'authenticated', 'owner2@foorendy.local', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000b2',
   'authenticated', 'authenticated', 'admin@foorendy.local',  now(), now())
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 1. owners / admin
-- ---------------------------------------------------------------------
insert into owners (owner_id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'dev@foorendy.local'),
  ('00000000-0000-0000-0000-0000000000a3', 'owner2@foorendy.local')
on conflict (owner_id) do nothing;

insert into admin (admin_id, email) values
  ('00000000-0000-0000-0000-0000000000b2', 'admin@foorendy.local')
on conflict (admin_id) do nothing;

-- ---------------------------------------------------------------------
-- 2. trends  (Home.jsx 의 trendCards 10개 그대로)
--   previous_rank = 현재 rank 에 delta 를 역산한 값
--   (▲N = 위로 N칸 → prev = rank + N,  ▼N = 아래로 N칸 → prev = rank - N)
-- ---------------------------------------------------------------------
insert into trends (name, trend_score, rank, previous_rank, status) values
  ('우베',             98.2,  1,  2,  'HOT'),
  ('애플망고',         91.5,  2,  5,  'RISING'),
  ('두바이쫀득쿠키',   86.0,  3,  1,  'FALLING'),
  ('버터떡',           80.3,  4,  2,  'FALLING'),
  ('초코바게트',       74.1,  5,  8,  'RISING'),
  ('말빵',             69.8,  6,  9,  'HOT'),
  ('황치즈',           63.2,  7,  4,  'FALLING'),
  ('말차',             57.5,  8, 10,  'HOT'),
  ('크루키',           52.0,  9,  6,  'FALLING'),
  ('약과쿠키',         47.3, 10,  5,  'FALLING');

-- ---------------------------------------------------------------------
-- 3. stores  (Map.jsx 우베 판매 매장 목록 그대로)
--   '연남 우베하우스' → dev 사장님(a1) 소유: 대시보드용. 나머지는 owner2(a3).
-- ---------------------------------------------------------------------
insert into stores (owner_id, name, address, latitude, longitude, phone, business_reg_no, naver_place_url) values
  ('00000000-0000-0000-0000-0000000000a1', '연남 우베하우스',   '서울 마포구 연남동 239-1',  37.5605, 126.9230, '02-1234-5678', '123-45-67890', 'https://place.naver.com/restaurant/1'),
  ('00000000-0000-0000-0000-0000000000a3', '성수 우베 라떼바',   '서울 성동구 성수동2가 333', 37.5588, 126.9290, '02-2222-3333', '223-45-67891', 'https://place.naver.com/restaurant/2'),
  ('00000000-0000-0000-0000-0000000000a3', '합정 디저트연구소', '서울 마포구 합정동 411',   37.5495, 126.9140, '02-3333-4444', '323-45-67892', 'https://place.naver.com/restaurant/3'),
  ('00000000-0000-0000-0000-0000000000a3', '망원 우베 베이커리', '서울 마포구 망원동 412',   37.5560, 126.9050, '02-4444-5555', '423-45-67893', 'https://place.naver.com/restaurant/4'),
  ('00000000-0000-0000-0000-0000000000a3', '이대 우베 푸딩샵',   '서울 서대문구 대현동 55',  37.5630, 126.9180, '02-5555-6666', '523-45-67894', 'https://place.naver.com/restaurant/5');

-- ---------------------------------------------------------------------
-- 4. products  (전부 trend_id=1 '우베'. stock_status 는 quantity 규칙대로)
--   규칙: 0 → SOLD_OUT, 1~5 → LOW, 그 외 → AVAILABLE
--   ⚠️ store_id 는 하드코딩하지 않고 매장 이름으로 조회 → identity 값에 무관.
-- ---------------------------------------------------------------------
insert into products (store_id, trend_id, name, price, quantity, stock_status, stock_updated_at) values
  ((select store_id from stores where name = '연남 우베하우스'), (select trend_id from trends where name = '우베'), '우베 케이크',  6800,  8, 'AVAILABLE', now() - interval '10 minutes'),
  ((select store_id from stores where name = '연남 우베하우스'), (select trend_id from trends where name = '우베'), '우베 라떼',    5500, 14, 'AVAILABLE', now() - interval '5 minutes'),
  ((select store_id from stores where name = '성수 우베 라떼바'), (select trend_id from trends where name = '우베'), '우베 라떼',    5500, 14, 'AVAILABLE', now() - interval '22 minutes'),
  ((select store_id from stores where name = '합정 디저트연구소'), (select trend_id from trends where name = '우베'), '우베 카눌레',  3800,  0, 'SOLD_OUT',  now() - interval '5 minutes'),
  ((select store_id from stores where name = '망원 우베 베이커리'), (select trend_id from trends where name = '우베'), '우베 크림빵',  4200,  3, 'LOW',       now() - interval '1 minutes'),
  ((select store_id from stores where name = '이대 우베 푸딩샵'),   (select trend_id from trends where name = '우베'), '우베 푸딩',    4500, 11, 'AVAILABLE', now());

-- ---------------------------------------------------------------------
-- 5. inventory_logs  (연남 우베하우스 '우베 케이크' 변경 이력)
-- ---------------------------------------------------------------------
insert into inventory_logs (product_id, old_quantity, new_quantity, updated_at) values
  ((select p.product_id from products p join stores s on s.store_id = p.store_id
    where s.name = '연남 우베하우스' and p.name = '우베 케이크'), 0,  25, now() - interval '6 hours'),
  ((select p.product_id from products p join stores s on s.store_id = p.store_id
    where s.name = '연남 우베하우스' and p.name = '우베 케이크'), 25, 12, now() - interval '3 hours'),
  ((select p.product_id from products p join stores s on s.store_id = p.store_id
    where s.name = '연남 우베하우스' and p.name = '우베 케이크'), 12,  8, now() - interval '10 minutes');

-- ---------------------------------------------------------------------
-- 6. store_notices  (활성 공지 — Map.jsx 팝오버 문구)
-- ---------------------------------------------------------------------
insert into store_notices (store_id, content, status, expires_at) values
  ((select store_id from stores where name = '연남 우베하우스'),
   '매일 11시 오픈! 우베 페이스트와 생크림을 듬뿍 넣은 시그니처 우베 케이크. 평일 14시 이후엔 빠르게 소진되니 미리 방문 추천드려요 :)', 'PUBLISHED', now() + interval '3 days'),
  ((select store_id from stores where name = '성수 우베 라떼바'),
   '성수점 우베 라떼 신메뉴 출시! 첫 주 10% 할인.', 'PUBLISHED', now() + interval '5 days');

-- ---------------------------------------------------------------------
-- 7. store_applications  (Admin 심사 화면용 — 탭별로 골고루)
--   PENDING / APPROVED(연남 우베하우스 연결) / REJECTED
-- ---------------------------------------------------------------------
insert into store_applications
  (applicant_id, applicant_name, cafe_name, address, phone, business_reg_no, business_license_url,
   terms_agreed_at, marketing_agreed, status, rejection_reason, store_id, reviewed_by, submitted_at, reviewed_at)
values
  ('00000000-0000-0000-0000-0000000000a1', '김연남', '연남 우베하우스', '서울 마포구 연남동 239-1', '02-1234-5678', '123-45-67890',
   'https://example.com/biz/yeonnam.pdf', now() - interval '5 days', false, 'APPROVED', null,
   (select store_id from stores where name = '연남 우베하우스'),
   '00000000-0000-0000-0000-0000000000b2', now() - interval '5 days', now() - interval '4 days'),
  ('00000000-0000-0000-0000-0000000000a3', '박성수', '성수 디저트랩', '서울 성동구 성수동1가 100', '02-7777-8888', '777-88-99001',
   'https://example.com/biz/seongsu.pdf', now() - interval '1 days', true, 'PENDING', null, null,
   null, now() - interval '1 days', null),
  ('00000000-0000-0000-0000-0000000000a3', '이망원', '망원 베이크샵', '서울 마포구 망원동 200', '02-9999-0000', '999-00-11223',
   'https://example.com/biz/mangwon.pdf', now() - interval '2 days', false, 'REJECTED', '사업자등록증 식별 불가 — 재업로드 요청', null,
   '00000000-0000-0000-0000-0000000000b2', now() - interval '2 days', now() - interval '1 days');

-- ---------------------------------------------------------------------
-- 8. analytics_logs  (대시보드 KPI / 최근 이벤트용 — 연남 우베하우스)
-- ---------------------------------------------------------------------
insert into analytics_logs (visitor_id, store_id, product_id, trend_id, event_type, created_at) values
  ('anon-001', (select store_id from stores where name = '연남 우베하우스'),
    (select p.product_id from products p join stores s on s.store_id = p.store_id where s.name = '연남 우베하우스' and p.name = '우베 케이크'),
    (select trend_id from trends where name = '우베'), 'VIEW_STORE',   now() - interval '2 hours'),
  ('anon-002', (select store_id from stores where name = '연남 우베하우스'),
    (select p.product_id from products p join stores s on s.store_id = p.store_id where s.name = '연남 우베하우스' and p.name = '우베 케이크'),
    (select trend_id from trends where name = '우베'), 'VIEW_STORE',   now() - interval '90 minutes'),
  ('anon-003', (select store_id from stores where name = '연남 우베하우스'), null, (select trend_id from trends where name = '우베'), 'SEARCH_TREND', now() - interval '80 minutes'),
  ('anon-004', (select store_id from stores where name = '연남 우베하우스'), null, (select trend_id from trends where name = '우베'), 'CLICK_MARKER', now() - interval '70 minutes'),
  ('anon-005', (select store_id from stores where name = '연남 우베하우스'),
    (select p.product_id from products p join stores s on s.store_id = p.store_id where s.name = '연남 우베하우스' and p.name = '우베 라떼'),
    (select trend_id from trends where name = '우베'), 'VIEW_STORE',   now() - interval '30 minutes');

commit;
