
alter table public.access_requests add column if not exists token_id uuid references public.access_tokens(id) on delete set null;
alter table public.access_requests enable row level security;
alter table public.access_tokens enable row level security;
alter table public.analytics_events enable row level security;
alter policy "Admin full access on access_requests" on public.access_requests to authenticated using (auth.uid()='a899bd7c-d921-4bf4-a3d6-63ff0460e418'::uuid) with check (auth.uid()='a899bd7c-d921-4bf4-a3d6-63ff0460e418'::uuid);
alter policy "Public can insert access_requests" on public.access_requests to anon with check (status='pending' and token_id is null and length(trim(name)) between 2 and 120 and length(email) between 3 and 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and coalesce(length(reason),0)<=2000 and coalesce(length(linkedin),0)<=500);
alter policy "Admin full access on access_tokens" on public.access_tokens to authenticated using (auth.uid()='a899bd7c-d921-4bf4-a3d6-63ff0460e418'::uuid) with check (auth.uid()='a899bd7c-d921-4bf4-a3d6-63ff0460e418'::uuid);
alter policy "Tokens viewable for verification" on public.access_tokens to anon using (active and (expires_at is null or expires_at>now()) and token=(coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb->>'x-portfolio-token'));
alter policy "Admin can view analytics" on public.analytics_events to authenticated using (auth.uid()='a899bd7c-d921-4bf4-a3d6-63ff0460e418'::uuid);
alter policy "Allow public insert analytics" on public.analytics_events to anon with check (event_type in ('page_enter','page_leave','page_view','work_view') and exists(select 1 from public.access_tokens t where t.id=token_id and t.active and (t.expires_at is null or t.expires_at>now())));
create or replace function public.review_about_request(request_id uuid, approve boolean) returns uuid language plpgsql security invoker set search_path='' as $$
declare r public.access_requests; linked_id uuid;
begin
if auth.uid() is distinct from 'a899bd7c-d921-4bf4-a3d6-63ff0460e418'::uuid then raise exception 'Forbidden'; end if;
select * into r from public.access_requests where id=request_id for update;
if not found or r.status<>'pending' then raise exception 'Request already reviewed or missing'; end if;
if approve then
insert into public.access_tokens(token,label,active,expires_at) values(replace(gen_random_uuid()::text,'-',''),r.name,true,now()+interval '60 days') returning id into linked_id;
end if;
update public.access_requests set status=case when approve then 'approved' else 'rejected' end, token_id=linked_id where id=request_id;
return linked_id;
end $$;
revoke all on function public.review_about_request(uuid,boolean) from public,anon;
grant execute on function public.review_about_request(uuid,boolean) to authenticated;
create index if not exists analytics_link_pages on public.analytics_events(token_id,event_type,created_at);
create or replace function public.about_access_stats(link_id uuid) returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object(
'total',(select count(*) from public.analytics_events where token_id=link_id and event_type='page_enter'),
'pages',coalesce((select jsonb_agg(row_to_json(p)) from (select coalesce(page_path,'Sense pàgina registrada') as page,count(*) as count from public.analytics_events where token_id=link_id and event_type='page_enter' group by page_path order by count(*) desc) p),'[]'::jsonb),
'days',coalesce((select jsonb_agg(row_to_json(d)) from (select (created_at at time zone 'Europe/Madrid')::date as date,count(*) as count from public.analytics_events where token_id=link_id and event_type='page_enter' and created_at>=now()-interval '30 days' group by 1 order by 1) d),'[]'::jsonb));
$$;
revoke all on function public.about_access_stats(uuid) from public,anon;
grant execute on function public.about_access_stats(uuid) to authenticated;


-- The old production application does not yet send x-portfolio-token.
-- These two legacy policy definitions are retained until the new app is deployed;
-- activate-link-verification.sql tightens them after deployment verification.
alter policy "Tokens viewable for verification" on public.access_tokens to public using (true);
alter policy "Allow public insert analytics" on public.analytics_events to public with check (event_type is not null);
