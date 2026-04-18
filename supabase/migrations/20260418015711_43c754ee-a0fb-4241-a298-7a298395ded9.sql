
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_rewards_claimed integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.claim_referral_boost_reward(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_count integer;
  claimed integer;
  milestones_due integer;
  i integer;
BEGIN
  SELECT referral_count, referral_rewards_claimed INTO ref_count, claimed
  FROM public.profiles WHERE user_id = _user_id;

  IF ref_count IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;

  milestones_due := floor(ref_count / 10) - claimed;

  IF milestones_due <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No new rewards available', 'referral_count', ref_count, 'claimed', claimed);
  END IF;

  -- Grant a 2-day boost subscription per milestone
  FOR i IN 1..milestones_due LOOP
    INSERT INTO public.seller_subscriptions (user_id, type, tier, expires_at, is_active)
    VALUES (_user_id, 'boost', 1, now() + interval '2 days', true);
  END LOOP;

  UPDATE public.profiles
  SET referral_rewards_claimed = claimed + milestones_due
  WHERE user_id = _user_id;

  RETURN jsonb_build_object('success', true, 'days_granted', milestones_due * 2, 'milestones', milestones_due);
END;
$$;

CREATE OR REPLACE FUNCTION public.activate_free_verification(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_active boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.seller_subscriptions
    WHERE user_id = _user_id AND type = 'verification' AND is_active = true AND expires_at > now()
  ) INTO has_active;

  IF has_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already verified');
  END IF;

  INSERT INTO public.seller_subscriptions (user_id, type, tier, expires_at, is_active)
  VALUES (_user_id, 'verification', 1, now() + interval '30 days', true);

  RETURN jsonb_build_object('success', true);
END;
$$;
