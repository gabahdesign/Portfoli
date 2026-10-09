-- Apply only after the new portfolio is deployed: legacy code does not send
-- x-portfolio-token. Keep legacy verification/analytics policies until then.
-- Preserves the existing policy objects, tables, data and functions.
alter policy "Tokens viewable for verification" on public.access_tokens to anon using (
active and (expires_at is null or expires_at>now()) and token=(coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb->>'x-portfolio-token'));
alter policy "Allow public insert analytics" on public.analytics_events to anon with check (
event_type in ('page_enter','page_leave','page_view','work_view') and exists(select 1 from public.access_tokens t where t.id=token_id and t.active and (t.expires_at is null or t.expires_at>now())));
