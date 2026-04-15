import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Shield, FileText, AlertTriangle, Users, Lock, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "tos", label: "Terms of Service", icon: FileText },
  { key: "buyer", label: "Buyer Guidelines", icon: Users },
  { key: "seller", label: "Seller Guidelines", icon: Scale },
  { key: "community", label: "Community", icon: Users },
  { key: "safety", label: "Safety Tips", icon: Shield },
  { key: "privacy", label: "Privacy", icon: Lock },
];

const content: Record<string, { title: string; sections: { heading: string; text: string }[] }> = {
  tos: {
    title: "Terms of Service",
    sections: [
      { heading: "1. Acceptance", text: "By using SokoMtaani, you agree to these terms. If you do not agree, do not use the platform." },
      { heading: "2. Account Registration", text: "You must provide accurate information. You are responsible for your account security. Fake accounts will be permanently banned." },
      { heading: "3. Prohibited Items", text: "You may not sell illegal items, counterfeit goods, weapons, or any items that violate local laws." },
      { heading: "4. Seller Responsibility", text: "Sellers must accurately describe their products. Misleading listings will result in warnings and potential bans." },
      { heading: "5. Dispute Resolution", text: "SokoMtaani provides mediation but is not liable for transactions between users." },
      { heading: "6. Warnings & Bans", text: "Users who violate community standards will receive warnings. 3 warnings result in a temporary ban. Repeated violations lead to permanent bans." },
      { heading: "7. Content Ownership", text: "You retain ownership of content you post. By posting, you grant SokoMtaani license to display it." },
    ],
  },
  buyer: {
    title: "Buyer Guidelines",
    sections: [
      { heading: "Verify Before Buying", text: "Always check seller verification badges and ratings before purchasing. Verified sellers are more trustworthy." },
      { heading: "Meet Safely", text: "For local pickups, meet in public places. Never share personal banking details with sellers." },
      { heading: "Report Issues", text: "If a product doesn't match its description, report the seller immediately. We take reports seriously." },
      { heading: "Payment Safety", text: "Use secure payment methods. Be cautious of sellers requesting unusual payment methods." },
      { heading: "Check Danger Warnings", text: "If a seller profile shows a danger warning (red banner), proceed with extreme caution or find an alternative seller." },
    ],
  },
  seller: {
    title: "Seller Guidelines",
    sections: [
      { heading: "Accurate Listings", text: "Always provide accurate descriptions, real photos, and honest condition ratings. Misleading listings will be removed." },
      { heading: "Pricing", text: "Price your items fairly. Price gouging and deceptive pricing practices are not allowed." },
      { heading: "Communication", text: "Respond to buyer messages promptly. Good communication leads to better reviews and more sales." },
      { heading: "Shipping", text: "If you offer shipping, ship items promptly and provide tracking information when possible." },
      { heading: "3 Posts Per Week", text: "Free accounts are limited to 3 product posts per week and 3 total active listings. Upgrade to boost these limits." },
      { heading: "Reviews", text: "Respond professionally to all reviews, even negative ones. Never harass buyers for positive reviews." },
    ],
  },
  community: {
    title: "Community Standards",
    sections: [
      { heading: "Respect", text: "Treat all users with respect. Harassment, hate speech, and discrimination are not tolerated." },
      { heading: "Honest Dealings", text: "Be honest in all transactions. Scams and fraud will result in immediate permanent bans." },
      { heading: "Reporting", text: "Report violations to help keep the community safe. False reports are also a violation." },
      { heading: "Account Sharing", text: "Do not share your account with others. Each person must have their own account." },
    ],
  },
  safety: {
    title: "Safety Tips",
    sections: [
      { heading: "Public Meetings", text: "Always meet in well-lit, public places for in-person transactions." },
      { heading: "Verify Identity", text: "Look for verification badges. Higher-tier verified sellers have undergone identity verification." },
      { heading: "Trust Your Instincts", text: "If a deal seems too good to be true, it probably is. Walk away from suspicious offers." },
      { heading: "Protect Personal Info", text: "Never share passwords, banking PINs, or sensitive personal information." },
      { heading: "Check Reviews", text: "Read seller reviews before purchasing. Pay attention to both positive and negative feedback." },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      { heading: "Data Collection", text: "We collect information necessary to provide our services: name, email, location, and transaction data." },
      { heading: "Data Usage", text: "Your data is used to improve our services, show relevant products, and ensure platform safety." },
      { heading: "Data Sharing", text: "We do not sell your personal data to third parties. We may share data with payment processors for transactions." },
      { heading: "Your Rights", text: "You can request to view, modify, or delete your personal data at any time through account settings." },
    ],
  },
};

export default function ToSPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "tos");

  const activeContent = content[activeTab] || content.tos;

  return (
    <div className="animate-fade-in pb-4">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Legal & Safety</h1>
      </div>

      <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={cn("flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap", activeTab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              <t.icon className="h-3 w-3" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        <h2 className="text-lg font-bold mb-3">{activeContent.title}</h2>
        <div className="space-y-4">
          {activeContent.sections.map(s => (
            <div key={s.heading} className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-sm">{s.heading}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-6 p-4 bg-warning/10 border border-warning/30 rounded-xl mx-4">
        <p className="text-sm font-semibold flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-warning" /> Important</p>
        <p className="text-xs text-muted-foreground mt-1">Violation of these terms may result in warnings, temporary bans, or permanent account suspension. Take time to read and understand all guidelines.</p>
      </div>
    </div>
  );
}
