
-- Device fingerprint tracking table
CREATE TABLE public.device_fingerprints (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  fingerprint text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fingerprints" ON public.device_fingerprints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fingerprints" ON public.device_fingerprints FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Unique constraints to detect duplicate device/IP
CREATE UNIQUE INDEX idx_unique_fingerprint ON public.device_fingerprints (fingerprint);
CREATE UNIQUE INDEX idx_unique_ip ON public.device_fingerprints (ip_address) WHERE ip_address IS NOT NULL;

-- Function to check if fingerprint or IP already registered to another user
CREATE OR REPLACE FUNCTION public.check_device_duplicate(_fingerprint text, _ip text)
RETURNS TABLE(existing_user_id uuid, match_type text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT user_id, 'fingerprint' as match_type FROM public.device_fingerprints WHERE fingerprint = _fingerprint AND user_id != auth.uid()
  UNION ALL
  SELECT user_id, 'ip' as match_type FROM public.device_fingerprints WHERE ip_address = _ip AND ip_address IS NOT NULL AND user_id != auth.uid()
  LIMIT 1;
$$;

-- Function to check daily product post limit (max 3 per day)
CREATE OR REPLACE FUNCTION public.check_daily_product_limit(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT (
    SELECT count(*) FROM public.products 
    WHERE seller_id = _user_id 
    AND created_at >= (now() AT TIME ZONE 'UTC')::date::timestamptz
  ) < 3;
$$;
