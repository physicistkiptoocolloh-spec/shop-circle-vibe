// Invite/share helpers
export const INVITE_BASE = "https://sokomtaanii.web.app";

export const inviteUrl = (referralCode?: string | null) =>
  referralCode ? `${INVITE_BASE}/?ref=${referralCode}` : INVITE_BASE;

export const productShareUrl = (productId: string, referralCode?: string | null) => {
  const base = `${INVITE_BASE}/product/${productId}`;
  return referralCode ? `${base}?ref=${referralCode}` : base;
};

export async function shareLink(opts: { title: string; text: string; url: string }) {
  if (navigator.share) {
    try { await navigator.share(opts); return true; } catch { /* user cancelled */ }
  }
  await navigator.clipboard.writeText(opts.url);
  return false;
}

// Direct social-media share URLs (open in a new tab)
export const socialShareUrls = (text: string, url: string) => ({
  whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  email: `mailto:?subject=${encodeURIComponent("Join me on SokoMtaani")}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
});

const REF_KEY = "sokomtaani.referral_code";
export const captureReferralFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) localStorage.setItem(REF_KEY, ref);
};
export const consumeReferralCode = (): string | null => {
  const v = localStorage.getItem(REF_KEY);
  if (v) localStorage.removeItem(REF_KEY);
  return v;
};
