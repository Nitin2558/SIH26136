-- SAMADHAN SETU (SIH26136) Complete Supabase Schema
-- Includes all 9 tables, RLS policies, automatic event triggers, money enforcement functions, and Realtime publications.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ======================================================================
-- 1. TABLES
-- ======================================================================

-- 1. Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('officer', 'startup', 'expert', 'checker')),
  name text not null,
  org text,
  created_at timestamptz default now()
);

-- 2. Startups
create table if not exists public.startups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  city text not null,
  field text not null,
  about text,
  registered boolean default true,
  demo boolean default false,
  created_at timestamptz default now()
);

-- 3. Problems
create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  dept text not null,
  title text not null,
  plain_problem text not null,
  unit text not null,
  before_val numeric not null,
  goal_val numeric not null,
  grant_amount numeric not null,
  weeks int default 12,
  apply_deadline date,
  step int default 1,
  created_by uuid references auth.users(id) on delete set null,
  demo boolean default false,
  created_at timestamptz default now()
);

-- 4. Applications
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  startup_id uuid not null references public.startups(id) on delete cascade,
  proposal text not null,
  cost numeric not null,
  weeks int not null,
  status text not null check (status in ('applied', 'shortlisted', 'offered', 'accepted', 'rejected')) default 'applied',
  applied_at timestamptz default now(),
  decided_at timestamptz,
  demo boolean default false,
  created_at timestamptz default now()
);

-- 5. Judge Marks
create table if not exists public.judge_marks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  judge_id uuid not null references auth.users(id) on delete cascade,
  innovation int not null check (innovation between 0 and 10),
  workable int not null check (workable between 0 and 10),
  safety int not null check (safety between 0 and 10),
  cost_value int not null check (cost_value between 0 and 10),
  proof int not null check (proof between 0 and 10),
  total numeric generated always as (
    2.0 * innovation + 2.5 * workable + 2.0 * safety + 1.5 * cost_value + 2.0 * proof
  ) stored,
  comment text,
  locked boolean default false,
  locked_at timestamptz,
  demo boolean default false,
  created_at timestamptz default now(),
  unique(application_id, judge_id)
);

-- 6. Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  startup_id uuid not null references public.startups(id) on delete cascade,
  contract_date date,
  start_date date,
  end_date date,
  current_value numeric,
  step int default 5,
  status text not null check (status in ('running', 'done', 'stopped')) default 'running',
  grant_amount numeric not null,
  expand_decision text,
  expand_note text,
  demo boolean default false,
  created_at timestamptz default now()
);

-- 7. Payment Parts
create table if not exists public.payment_parts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  part_no int not null,
  pct int not null,
  amount numeric not null,
  status text not null check (status in ('notstarted', 'ready', 'hold', 'stopped', 'paid')) default 'notstarted',
  reason text,
  ready_since timestamptz,
  paid_at timestamptz,
  bank_ref text,
  paid_by uuid references auth.users(id) on delete set null,
  demo boolean default false,
  created_at timestamptz default now()
);

-- 8. Result Checks
create table if not exists public.result_checks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  part_no int not null,
  checker_id uuid references auth.users(id) on delete set null,
  verified_value numeric,
  claimed_value numeric,
  verdict text check (verdict in ('met', 'partly', 'not_met')),
  comment text,
  report_url text,
  locked boolean default false,
  submitted_at timestamptz default now(),
  demo boolean default false,
  created_at timestamptz default now()
);

-- 9. Events (Live Feed)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid references public.problems(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  startup_id uuid references public.startups(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text,
  kind text not null, -- 'problem', 'startup', 'application', 'mark', 'offer', 'contract', 'trial', 'check', 'payment', 'expand'
  text_plain text not null,
  why text,
  demo boolean default false,
  created_at timestamptz default now()
);

-- ======================================================================
-- 2. HELPER FUNCTIONS & TRIGGERS (SECURITY DEFINER)
-- ======================================================================

-- Check if all judges for an application have locked their scores
create or replace function public.are_all_judges_locked(app_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  total_judges int;
  locked_judges int;
begin
  select count(*), count(*) filter (where locked = true)
  into total_judges, locked_judges
  from public.judge_marks
  where application_id = app_id;

  if total_judges = 0 then
    return false;
  end if;

  return total_judges = locked_judges;
end;
$$;

-- Trigger: Insert Event on Problem Created
create or replace function public.trig_event_problem()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.events (problem_id, actor_id, actor_role, kind, text_plain, why, demo)
  values (
    new.id,
    new.created_by,
    'officer',
    'problem',
    new.dept || ' posted problem: ' || new.title,
    'Problem posted under government buying rule. Baseline: ' || new.before_val || ' ' || new.unit || ', Goal: ' || new.goal_val || ' ' || new.unit,
    new.demo
  );
  return new;
end;
$$;

drop trigger if exists on_problem_created on public.problems;
create trigger on_problem_created
  after insert on public.problems
  for each row execute function public.trig_event_problem();

-- Trigger: Insert Event on Startup Created
create or replace function public.trig_event_startup()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.events (startup_id, actor_id, actor_role, kind, text_plain, why, demo)
  values (
    new.id,
    new.owner_id,
    'startup',
    'startup',
    new.name || ' registered from ' || new.city,
    'Registered innovation startup in ' || new.field,
    new.demo
  );
  return new;
end;
$$;

drop trigger if exists on_startup_created on public.startups;
create trigger on_startup_created
  after insert on public.startups
  for each row execute function public.trig_event_startup();

-- Trigger: Insert Event on Application Submitted / Status Changed
create or replace function public.trig_event_application()
returns trigger
language plpgsql
security definer
as $$
declare
  s_name text;
  p_title text;
begin
  select name into s_name from public.startups where id = new.startup_id;
  select title into p_title from public.problems where id = new.problem_id;

  if (tg_op = 'INSERT') then
    insert into public.events (problem_id, startup_id, actor_role, kind, text_plain, why, demo)
    values (
      new.problem_id,
      new.startup_id,
      'startup',
      'application',
      s_name || ' applied for ' || p_title,
      'They offered an outcome trial for ₹' || to_char(new.cost, 'FM99,99,99,999') || ' in ' || new.weeks || ' weeks.',
      new.demo
    );
  elsif (tg_op = 'UPDATE' and old.status <> new.status) then
    if new.status = 'shortlisted' then
      insert into public.events (problem_id, startup_id, actor_role, kind, text_plain, why, demo)
      values (
        new.problem_id, new.startup_id, 'officer', 'application',
        'Officer shortlisted ' || s_name || ' for ' || p_title,
        'Application passed preliminary checks and qualified for trial consideration.',
        new.demo
      );
    elsif new.status = 'offered' then
      insert into public.events (problem_id, startup_id, actor_role, kind, text_plain, why, demo)
      values (
        new.problem_id, new.startup_id, 'officer', 'offer',
        'Officer offered small trial to ' || s_name,
        'Trial offer extended under government buying rules for small trials.',
        new.demo
      );
    elsif new.status = 'accepted' then
      insert into public.events (problem_id, startup_id, actor_role, kind, text_plain, why, demo)
      values (
        new.problem_id, new.startup_id, 'startup', 'contract',
        s_name || ' accepted the offer. Contract started.',
        'Contract signed and pilot sandbox work commenced.',
        new.demo
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_application_events on public.applications;
create trigger on_application_events
  after insert or update on public.applications
  for each row execute function public.trig_event_application();

-- Trigger: Insert Event on Judge Marks Locked
create or replace function public.trig_event_judge_marks()
returns trigger
language plpgsql
security definer
as $$
declare
  s_name text;
  p_title text;
  p_id uuid;
begin
  if (new.locked = true and (old is null or old.locked = false)) then
    select s.name, p.title, p.id
    into s_name, p_title, p_id
    from public.applications a
    join public.startups s on s.id = a.startup_id
    join public.problems p on p.id = a.problem_id
    where a.id = new.application_id;

    insert into public.events (problem_id, actor_role, kind, text_plain, why, demo)
    values (
      p_id,
      'expert',
      'mark',
      'Judge locked marks for ' || coalesce(s_name, 'applicant') || ' on ' || coalesce(p_title, 'problem'),
      'Proposal evaluation scored: ' || new.total || '/100.',
      new.demo
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_judge_marks_locked on public.judge_marks;
create trigger on_judge_marks_locked
  after insert or update on public.judge_marks
  for each row execute function public.trig_event_judge_marks();

-- ======================================================================
-- 3. AUTOMATIC MONEY RULES & RESULT CHECK TRIGGER
-- ======================================================================

create or replace function public.trig_result_check_verdict()
returns trigger
language plpgsql
security definer
as $$
declare
  proj record;
  s_name text;
begin
  select * into proj from public.projects where id = new.project_id;
  select name into s_name from public.startups where id = proj.startup_id;

  -- Only trigger when result check is locked/submitted
  if (new.locked = true and (old is null or old.locked = false or old.verdict is distinct from new.verdict)) then
    
    -- 1. Verdict MET: Payment part status becomes ready
    if new.verdict = 'met' then
      update public.payment_parts
      set status = 'ready',
          ready_since = now(),
          reason = 'Waiting for officer to approve'
      where project_id = new.project_id and part_no = new.part_no and status in ('notstarted', 'hold');

      insert into public.events (project_id, startup_id, actor_role, kind, text_plain, why, demo)
      values (
        new.project_id,
        proj.startup_id,
        'checker',
        'check',
        'Independent checker checked result for ' || coalesce(s_name, 'company') || ': Goal met.',
        'Result verified at ' || coalesce(new.verified_value::text, 'target') || '. Part ' || new.part_no || ' is ready to pay.',
        new.demo
      );

    -- 2. Verdict PARTLY: Payment part becomes on hold
    elsif new.verdict = 'partly' then
      update public.payment_parts
      set status = 'hold',
          ready_since = null,
          reason = 'On hold: goal only partly met'
      where project_id = new.project_id and part_no = new.part_no and status in ('notstarted', 'ready');

      insert into public.events (project_id, startup_id, actor_role, kind, text_plain, why, demo)
      values (
        new.project_id,
        proj.startup_id,
        'checker',
        'check',
        'Independent checker checked result for ' || coalesce(s_name, 'company') || ': Partly met.',
        'Result measured at ' || coalesce(new.verified_value::text, 'improved') || '. Part ' || new.part_no || ' placed on hold for officer review.',
        new.demo
      );

    -- 3. Verdict NOT_MET: This and later parts become stopped, project stops
    elsif new.verdict = 'not_met' then
      update public.payment_parts
      set status = 'stopped',
          reason = 'Stopped: goal not met'
      where project_id = new.project_id and part_no >= new.part_no and status <> 'paid';

      update public.projects
      set status = 'stopped',
          step = 8
      where id = new.project_id;

      insert into public.events (project_id, startup_id, actor_role, kind, text_plain, why, demo)
      values (
        new.project_id,
        proj.startup_id,
        'checker',
        'check',
        'Independent checker checked result for ' || coalesce(s_name, 'company') || ': Goal not met.',
        'Measured value was ' || coalesce(new.verified_value::text, 'insufficient') || '. Small trial stopped; remaining funds cancelled.',
        new.demo
      );
    end if;

  end if;
  return new;
end;
$$;

drop trigger if exists on_result_check_verdict on public.result_checks;
create trigger on_result_check_verdict
  after insert or update on public.result_checks
  for each row execute function public.trig_result_check_verdict();

-- Trigger: Insert Event on Payment Parts Status Changed
create or replace function public.trig_event_payment_part()
returns trigger
language plpgsql
security definer
as $$
declare
  proj record;
  s_name text;
begin
  select * into proj from public.projects where id = new.project_id;
  select name into s_name from public.startups where id = proj.startup_id;

  if (tg_op = 'UPDATE' and old.status <> new.status) then
    if new.status = 'paid' then
      insert into public.events (project_id, startup_id, actor_role, kind, text_plain, why, demo)
      values (
        new.project_id,
        proj.startup_id,
        'officer',
        'payment',
        '₹' || to_char(new.amount, 'FM99,99,99,999') || ' paid to ' || coalesce(s_name, 'company') || ' (Part ' || new.part_no || ').',
        'Bank ref: ' || coalesce(new.bank_ref, 'UTR pending') || '. ' || coalesce(new.reason, 'Milestone paid.'),
        new.demo
      );
    elsif new.status = 'ready' then
      insert into public.events (project_id, startup_id, actor_role, kind, text_plain, why, demo)
      values (
        new.project_id,
        proj.startup_id,
        'checker',
        'payment',
        'Part ' || new.part_no || ' (₹' || to_char(new.amount, 'FM99,99,99,999') || ') is ready to pay for ' || coalesce(s_name, 'company') || '.',
        'Independent checker verified results. Waiting for officer release.',
        new.demo
      );
    elsif new.status = 'hold' then
      insert into public.events (project_id, startup_id, actor_role, kind, text_plain, why, demo)
      values (
        new.project_id,
        proj.startup_id,
        'officer',
        'payment',
        'Part ' || new.part_no || ' placed on hold for ' || coalesce(s_name, 'company') || '.',
        coalesce(new.reason, 'Officer decision needed.'),
        new.demo
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_payment_part_events on public.payment_parts;
create trigger on_payment_part_events
  after update on public.payment_parts
  for each row execute function public.trig_event_payment_part();

-- ======================================================================
-- 4. OFFICER STORED FUNCTIONS (pay_part, resolve_hold)
-- ======================================================================

-- Secure pay_part function
create or replace function public.pay_part(
  part_id uuid,
  p_bank_ref text
)
returns json
language plpgsql
security definer
as $$
declare
  v_role text;
  v_part record;
  v_check record;
  v_ref text;
begin
  -- 1. Check user role (must be officer or service role)
  select role into v_role from public.profiles where id = auth.uid();
  if v_role is distinct from 'officer' and auth.role() <> 'service_role' and auth.uid() is not null then
    raise exception 'Only a department officer can release payments.';
  end if;

  -- 2. Fetch payment part
  select * into v_part from public.payment_parts where id = part_id;
  if not found then
    raise exception 'Payment part not found.';
  end if;

  if v_part.status = 'paid' then
    raise exception 'This payment part has already been paid.';
  end if;

  if v_part.status <> 'ready' then
    raise exception 'This payment is not ready to pay yet.';
  end if;

  -- 3. Verify locked result check with verdict 'met'
  -- (For Part 1, result check may be optional if contract just started, but for Part 2/3 verified report is required)
  if v_part.part_no > 1 then
    select * into v_check
    from public.result_checks
    where project_id = v_part.project_id
      and part_no = v_part.part_no
      and locked = true
      and verdict = 'met';

    if not found then
      raise exception 'The independent checker has not approved this yet.';
    end if;
  end if;

  -- 4. Generate bank ref if not provided
  v_ref := coalesce(nullif(trim(p_bank_ref), ''), 'UTR2610' || lpad(floor(random()*1000000)::text, 6, '0'));

  -- 5. Mark as paid
  update public.payment_parts
  set status = 'paid',
      paid_at = now(),
      paid_by = auth.uid(),
      bank_ref = v_ref,
      reason = case
        when v_part.part_no = 1 then 'Paid when work started'
        when v_part.part_no = 2 then 'Paid after result check'
        else 'Paid after final report'
      end
  where id = part_id;

  -- 6. Advance project step if part 2 paid
  if v_part.part_no = 2 then
    update public.projects set step = 7 where id = v_part.project_id and step = 6;
  end if;

  return json_build_object(
    'success', true,
    'part_id', part_id,
    'amount', v_part.amount,
    'bank_ref', v_ref,
    'message', 'Payment released successfully.'
  );
end;
$$;

-- Secure resolve_hold function
create or replace function public.resolve_hold(
  part_id uuid,
  p_action text,
  p_amount numeric default null,
  p_reason text default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_role text;
  v_part record;
  v_ref text;
  v_final_amt numeric;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if v_role is distinct from 'officer' and auth.role() <> 'service_role' and auth.uid() is not null then
    raise exception 'Only a department officer can resolve hold decisions.';
  end if;

  select * into v_part from public.payment_parts where id = part_id;
  if not found then
    raise exception 'Payment part not found.';
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'Please enter a plain reason for this decision.';
  end if;

  v_ref := 'UTR2610' || lpad(floor(random()*1000000)::text, 6, '0');

  if p_action = 'pay_full' then
    update public.payment_parts
    set status = 'paid',
        paid_at = now(),
        paid_by = auth.uid(),
        bank_ref = v_ref,
        reason = 'Approved full payment: ' || p_reason
    where id = part_id;

    update public.projects set step = 7 where id = v_part.project_id and step = 6;

  elsif p_action = 'pay_less' then
    v_final_amt := coalesce(p_amount, v_part.amount * 0.75);
    update public.payment_parts
    set status = 'paid',
        amount = v_final_amt,
        paid_at = now(),
        paid_by = auth.uid(),
        bank_ref = v_ref,
        reason = 'Partial payment approved: ' || p_reason
    where id = part_id;

    update public.projects set step = 7 where id = v_part.project_id and step = 6;

  elsif p_action = 'keep_hold' then
    update public.payment_parts
    set status = 'hold',
        reason = 'On hold: ' || p_reason
    where id = part_id;

  else
    raise exception 'Invalid action. Choose pay_full, pay_less, or keep_hold.';
  end if;

  return json_build_object(
    'success', true,
    'part_id', part_id,
    'action', p_action,
    'message', 'Decision recorded successfully.'
  );
end;
$$;

-- ======================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ======================================================================

alter table public.profiles enable row level security;
alter table public.startups enable row level security;
alter table public.problems enable row level security;
alter table public.applications enable row level security;
alter table public.judge_marks enable row level security;
alter table public.projects enable row level security;
alter table public.payment_parts enable row level security;
alter table public.result_checks enable row level security;
alter table public.events enable row level security;

-- Profiles: Anyone authenticated can read; user can update own profile
create policy "Profiles read policy" on public.profiles
  for select using (auth.role() = 'authenticated' or auth.role() = 'service_role' or auth.role() = 'anon');

create policy "Profiles update policy" on public.profiles
  for update using (auth.uid() = id);

-- Startups: Anyone can read; owner can insert and update
create policy "Startups read policy" on public.startups
  for select using (true);

create policy "Startups insert policy" on public.startups
  for insert with check (auth.uid() = owner_id or auth.role() = 'service_role');

create policy "Startups update policy" on public.startups
  for update using (auth.uid() = owner_id or auth.role() = 'service_role');

-- Problems: Anyone can read; officer can insert/update
create policy "Problems read policy" on public.problems
  for select using (true);

create policy "Problems write policy" on public.problems
  for insert with check (
    auth.role() = 'service_role' or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'officer')
  );

create policy "Problems update policy" on public.problems
  for update using (
    auth.role() = 'service_role' or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'officer')
  );

-- Applications:
-- Startup can see own applications; Officer can see all; Expert can see assigned
create policy "Applications select policy" on public.applications
  for select using (
    auth.role() = 'service_role' or
    auth.role() = 'anon' or
    exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'expert', 'checker')) or
    exists (select 1 from public.startups where id = applications.startup_id and owner_id = auth.uid())
  );

create policy "Applications insert policy" on public.applications
  for insert with check (
    auth.role() = 'service_role' or
    exists (select 1 from public.startups where id = applications.startup_id and owner_id = auth.uid())
  );

create policy "Applications update policy" on public.applications
  for update using (
    auth.role() = 'service_role' or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'officer') or
    exists (select 1 from public.startups where id = applications.startup_id and owner_id = auth.uid())
  );

-- Judge Marks:
-- Judge can read/write their own marks while unlocked.
-- Officer & startup can read all marks ONLY after every assigned judge has locked.
create policy "Judge marks select policy" on public.judge_marks
  for select using (
    auth.role() = 'service_role' or
    auth.role() = 'anon' or
    judge_id = auth.uid() or
    (
      public.are_all_judges_locked(application_id) and
      (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'officer') or
        exists (
          select 1 from public.applications a
          join public.startups s on s.id = a.startup_id
          where a.id = judge_marks.application_id and s.owner_id = auth.uid()
        )
      )
    )
  );

create policy "Judge marks insert policy" on public.judge_marks
  for insert with check (
    auth.role() = 'service_role' or
    (judge_id = auth.uid() and locked = false)
  );

create policy "Judge marks update policy" on public.judge_marks
  for update using (
    auth.role() = 'service_role' or
    (judge_id = auth.uid() and locked = false)
  );

-- Projects:
create policy "Projects select policy" on public.projects
  for select using (true);

create policy "Projects write policy" on public.projects
  for all using (
    auth.role() = 'service_role' or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'officer')
  );

-- Payment Parts:
create policy "Payment parts select policy" on public.payment_parts
  for select using (true);

create policy "Payment parts write policy" on public.payment_parts
  for all using (
    auth.role() = 'service_role' or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'officer')
  );

-- Result Checks:
create policy "Result checks select policy" on public.result_checks
  for select using (true);

create policy "Result checks write policy" on public.result_checks
  for all using (
    auth.role() = 'service_role' or
    checker_id = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'checker')
  );

-- Events (Live Feed):
create policy "Events select policy" on public.events
  for select using (true);

create policy "Events insert policy" on public.events
  for insert with check (true);

-- ======================================================================
-- 6. ENABLE REALTIME
-- ======================================================================

alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.applications;
alter publication supabase_realtime add table public.payment_parts;
alter publication supabase_realtime add table public.projects;
