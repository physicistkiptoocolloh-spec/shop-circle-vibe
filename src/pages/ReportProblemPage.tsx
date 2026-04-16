import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Send, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const REPORT_TYPES = ["Bug or App Issue", "Scam or Fraud", "Inappropriate Content", "Account Issue", "Payment Problem", "Other"];

export default function ReportProblemPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <p className="text-sm text-muted-foreground">Sign in to report a problem.</p>
        <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm">Sign In</button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 animate-fade-in">
        <CheckCircle className="h-16 w-16 text-success" />
        <h2 className="text-xl font-bold">Report Submitted</h2>
        <p className="text-sm text-muted-foreground text-center">We'll review your report within 24 hours. Thank you for helping keep SokoMtaani safe.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-primary font-medium mt-2">Go Back</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-8">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Report a Problem</h1>
      </div>

      <div className="px-4 space-y-4 mt-2">
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">Reports are reviewed by our team. Please provide as much detail as possible.</p>
        </div>

        <div>
          <label className="text-sm font-medium">Problem Type</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {REPORT_TYPES.map(t => (
              <button key={t} onClick={() => setType(t)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the problem in detail..." rows={5} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none resize-none" />
        </div>

        <button
          onClick={() => { setSubmitted(true); toast({ title: "Report submitted" }); }}
          disabled={!type || !description}
          className="w-full bg-destructive text-destructive-foreground py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="h-4 w-4" /> Submit Report
        </button>
      </div>
    </div>
  );
}
