-- KYC verifications
CREATE TABLE public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  id_number TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own KYC" ON public.kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users submit own KYC" ON public.kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own pending KYC" ON public.kyc_verifications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Referral tracking on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID,
  ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0;

-- Auto-generate referral code for new users
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := lower(substring(md5(random()::text || NEW.user_id::text) from 1 for 8));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_referral_code ON public.profiles;
CREATE TRIGGER profiles_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Backfill existing rows
UPDATE public.profiles
  SET referral_code = lower(substring(md5(random()::text || user_id::text) from 1 for 8))
  WHERE referral_code IS NULL;

-- Increment referrer count
CREATE OR REPLACE FUNCTION public.increment_referral_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.profiles SET referral_count = referral_count + 1
      WHERE user_id = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_increment_referral ON public.profiles;
CREATE TRIGGER profiles_increment_referral
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.increment_referral_count();

-- FCM push tokens
CREATE TABLE public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tokens" ON public.push_tokens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add channel column to phone_otps to track WhatsApp vs SMS
ALTER TABLE public.phone_otps
  ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'sms';

-- KYC selfies storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-selfies', 'kyc-selfies', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own KYC selfies" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'kyc-selfies' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users view own KYC selfies" ON storage.objects
  FOR SELECT USING (bucket_id = 'kyc-selfies' AND auth.uid()::text = (storage.foldername(name))[1]);