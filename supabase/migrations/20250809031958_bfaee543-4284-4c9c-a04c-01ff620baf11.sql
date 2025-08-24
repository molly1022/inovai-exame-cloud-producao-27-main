-- Add explicit deny-all RLS policies for new security tables
-- Ensures linter doesn't flag "RLS enabled with no policy" while keeping data locked down

-- login_attempts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='login_attempts' AND policyname='deny_all_login_attempts_select'
  ) THEN
    CREATE POLICY deny_all_login_attempts_select ON public.login_attempts FOR SELECT USING (false);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='login_attempts' AND policyname='deny_all_login_attempts_mod'
  ) THEN
    CREATE POLICY deny_all_login_attempts_mod ON public.login_attempts FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;

-- clinic_sessions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clinic_sessions' AND policyname='deny_all_clinic_sessions_select'
  ) THEN
    CREATE POLICY deny_all_clinic_sessions_select ON public.clinic_sessions FOR SELECT USING (false);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clinic_sessions' AND policyname='deny_all_clinic_sessions_mod'
  ) THEN
    CREATE POLICY deny_all_clinic_sessions_mod ON public.clinic_sessions FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;

-- security_logs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='security_logs' AND policyname='deny_all_security_logs_select'
  ) THEN
    CREATE POLICY deny_all_security_logs_select ON public.security_logs FOR SELECT USING (false);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='security_logs' AND policyname='deny_all_security_logs_mod'
  ) THEN
    CREATE POLICY deny_all_security_logs_mod ON public.security_logs FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;

-- clinic_mfa
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clinic_mfa' AND policyname='deny_all_clinic_mfa_select'
  ) THEN
    CREATE POLICY deny_all_clinic_mfa_select ON public.clinic_mfa FOR SELECT USING (false);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clinic_mfa' AND policyname='deny_all_clinic_mfa_mod'
  ) THEN
    CREATE POLICY deny_all_clinic_mfa_mod ON public.clinic_mfa FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;