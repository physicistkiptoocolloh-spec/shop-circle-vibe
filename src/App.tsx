import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import HomePage from "@/pages/HomePage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import SellerShopPage from "@/pages/SellerShopPage";
import InboxPage from "@/pages/InboxPage";
import DashboardPage from "@/pages/DashboardPage";
import SellPage from "@/pages/SellPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import EditProfilePage from "@/pages/EditProfilePage";
import ProfilePage from "@/pages/ProfilePage";
import ToSPage from "@/pages/ToSPage";
import NotificationsPage from "@/pages/NotificationsPage";
import HelpCenterPage from "@/pages/HelpCenterPage";
import PrivacySettingsPage from "@/pages/PrivacySettingsPage";
import ReportProblemPage from "@/pages/ReportProblemPage";
import KycPage from "@/pages/KycPage";
import InviteFriendsPage from "@/pages/InviteFriendsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/shop/:id" element={<SellerShopPage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sell" element={<SellPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/tos" element={<ToSPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/privacy-settings" element={<PrivacySettingsPage />} />
              <Route path="/report" element={<ReportProblemPage />} />
              <Route path="/kyc" element={<KycPage />} />
              <Route path="/invite" element={<InviteFriendsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
