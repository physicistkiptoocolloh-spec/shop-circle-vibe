import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, MessageSquare, Shield, Package, CreditCard } from "lucide-react";

const faqs = [
  { q: "How do I list a product?", a: "Go to the Sell tab, fill in details, upload photos, and tap 'List Product'. You can list up to 3 products per day." },
  { q: "How do I contact a seller?", a: "On any product page, tap 'Message Seller' to start a conversation in your Inbox." },
  { q: "Is my payment secure?", a: "We use PesaPal for all transactions, which provides bank-level security and encryption." },
  { q: "How do I get verified?", a: "Go to Dashboard → Get Verified and choose a verification tier. Verified sellers get a trust badge." },
  { q: "How do I boost my product?", a: "Go to Dashboard → Boost Sales to increase your product's visibility and reach more buyers." },
  { q: "What if I have a problem with a seller?", a: "You can report a seller from their profile or product page. Reports are reviewed by our team within 24 hours." },
  { q: "How do I delete my account?", a: "Contact our admin team through Dashboard → Contact Admin with your request." },
  { q: "Can I edit my product after listing?", a: "Yes! Go to Dashboard → My Products and tap Edit on any product to update details." },
];

const categories = [
  { icon: Package, label: "Buying & Selling", count: 4 },
  { icon: CreditCard, label: "Payments", count: 2 },
  { icon: Shield, label: "Safety & Trust", count: 3 },
  { icon: MessageSquare, label: "Messaging", count: 2 },
];

export default function HelpCenterPage() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in pb-8">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Help Center</h1>
      </div>

      <div className="px-4 mb-4">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
          <HelpCircle className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-semibold">How can we help?</p>
          <p className="text-xs text-muted-foreground mt-1">Browse topics below or contact admin from your dashboard.</p>
        </div>
      </div>

      <div className="px-4 grid grid-cols-2 gap-2 mb-6">
        {categories.map(c => (
          <div key={c.label} className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
            <c.icon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-medium">{c.label}</p>
              <p className="text-[10px] text-muted-foreground">{c.count} articles</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4">
        <h2 className="font-bold mb-3">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-card border border-border rounded-xl overflow-hidden group">
              <summary className="px-4 py-3 text-sm font-medium cursor-pointer list-none flex items-center justify-between">
                {faq.q}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="px-4 pb-3 text-xs text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
