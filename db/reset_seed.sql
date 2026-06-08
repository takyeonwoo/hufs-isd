-- =====================================================================
-- Foorendy — 시드 데이터 전체 삭제 + ID 카운터 리셋
-- Supabase SQL Editor 에 붙여넣고 Run 하면 모든 행이 사라진다.
-- ⚠️ "시드만" 이 아니라 해당 테이블의 "모든 행"을 지운다.
--    진짜 사용자 데이터가 섞여 있으면 그것도 같이 삭제됨.
-- =====================================================================

-- 1) 도메인 테이블 (자식 → 부모 순서, cascade 로 한 번에)
truncate table
  inventory_logs,
  analytics_logs,
  store_notices,
  products,
  store_applications,
  stores,
  owners,
  admin,
  trends
restart identity cascade;

-- 2) DEV 가짜 인증 유저도 정리 (seed.sql 에서 auth.users 에 심은 3명)
delete from auth.users
where id in (
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000a3',
  '00000000-0000-0000-0000-0000000000b2'
);
