-- Phone OTP table
CREATE TABLE public.phone_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  verified BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_phone_otps_phone ON public.phone_otps(phone);
CREATE INDEX idx_phone_otps_expires ON public.phone_otps(expires_at);

ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- Only service role / edge function writes to this table; no direct user access
CREATE POLICY "No direct read" ON public.phone_otps FOR SELECT USING (false);

-- Add phone_verified column to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT false;

-- Function: check if user has active boost/verification subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id UUID, _type TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.seller_subscriptions
    WHERE user_id = _user_id
      AND type = _type
      AND is_active = true
      AND expires_at > now()
  );
$$;

-- Update daily product limit to consider tier
CREATE OR REPLACE FUNCTION public.check_daily_product_limit(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT count(*) FROM public.products 
    WHERE seller_id = _user_id 
    AND created_at >= (now() AT TIME ZONE 'UTC')::date::timestamptz
  ) < CASE
    WHEN public.has_active_subscription(_user_id, 'boost') THEN 999
    WHEN public.has_active_subscription(_user_id, 'verification') THEN 10
    ELSE 3
  END;
$$;