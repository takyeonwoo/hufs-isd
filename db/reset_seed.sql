-- =====================================================================
-- Foorendy — 시드 데이터 전체 삭제 + ID 카운터 리셋
-- Supabase SQL Editor 에 붙여넣고 Run 하면 모든 행이 사라진다.
-- ⚠️ "시드만" 이 아니라 해당 테이블의 "모든 행"을 지운다.
--    진짜 사용자 데이터가 섞여 있으면 그것도 같이 삭제됨.
-- =====================================================================

truncate table
  inventory_logs,
  analytics_logs,
  store_notices,
  products,
  store_applications,
  stores,
  trends
restart identity cascade;
