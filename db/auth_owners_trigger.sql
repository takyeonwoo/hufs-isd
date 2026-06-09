-- =====================================================================
-- Foorendy — 사장님(owner) 자동 생성 트리거
-- Supabase SQL Editor 에 한 번 실행.
--
-- 목적: Supabase Auth 로 새 유저가 가입(소셜 로그인 최초)하면
--       public.owners 행을 자동 생성한다.
--       → stores.owner_id → owners → auth.users FK 가 항상 보장되어,
--         OAuth 직후 입점신청/매장생성에서 FK 에러가 나지 않는다.
--
-- 비고: 관리자(admin)는 Supabase 를 쓰지 않는 고정계정(admin/admin)이라
--       auth.users 에 안 들어오므로 이 트리거의 영향을 받지 않는다.
-- =====================================================================

create or replace function public.handle_new_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.owners (owner_id, email)
  values (new.id, new.email)
  on conflict (owner_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_owner();
