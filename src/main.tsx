import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { captureReferralFromUrl } from "@/lib/invite";

// Capture ?ref=CODE from any URL the user lands on
captureReferralFromUrl();

createRoot(document.getElementById("root")!).render(<App />);
