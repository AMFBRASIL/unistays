import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { InstallPrompt } from "@/components/ui/install-prompt";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute"; // Auth protection
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import DashboardPDV from "./pages/DashboardPDV";
import Reservations from "./pages/Reservations";
import RoomMap from "./pages/RoomMap";
import Guests from "./pages/Guests";
import OccupancyMap from "./pages/OccupancyMap";
import PricingMap from "./pages/PricingMap";
import Financial from "./pages/Financial";
import CRM from "./pages/CRM";
import Integrations from "./pages/Integrations";
import Registrations from "./pages/Registrations";
import Properties from "./pages/Properties";
import AIAutomation from "./pages/AIAutomation";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import BookingEngine from "./pages/BookingEngine";
import DayUseEngine from "./pages/DayUseEngine";
import UserProfile from "./pages/UserProfile";
import Users from "./pages/Users";
import UserGroups from "./pages/UserGroups";
import Governanca from "./pages/Governanca";
import Marketplace from "./pages/Marketplace";
import HybridProperties from "./pages/HybridProperties";
import Events from "./pages/Events";
import NightAudit from "./pages/NightAudit";
import POSIntegration from "./pages/POSIntegration";
import POSTerminal from "./pages/POSTerminal";
import RatePlans from "./pages/RatePlans";
import CorporateContracts from "./pages/CorporateContracts";
import LoyaltyProgram from "./pages/LoyaltyProgram";
import GuestPortal from "./pages/GuestPortal";
import GuestPortalLogin from "./pages/GuestPortalLogin";
import GuestPortalResetPassword from "./pages/GuestPortalResetPassword";
import { GuestAuthProvider } from "@/contexts/GuestAuthContext";
import { ProtectedGuestRoute } from "@/components/ProtectedGuestRoute";
import CommunicationHub from "./pages/CommunicationHub";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import RevenueForecast from "./pages/RevenueForecast";
import InventoryManagement from "./pages/InventoryManagement";
import EmailMarketing from "./pages/EmailMarketing";
import AutoCheckIn from "./pages/AutoCheckIn";
import PreventiveMaintenance from "./pages/PreventiveMaintenance";
import EnergyManagement from "./pages/EnergyManagement";
import Workflow from "./pages/Workflow";
import Install from "./pages/Install";
import BanquetManagement from "./pages/BanquetManagement";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SetupWizard from "./pages/SetupWizard";
import SetupProgress from "./pages/SetupProgress";
import MultiProperty from "./pages/MultiProperty";
// import PageManagement from "./pages/admin/PageManagement";
import GroupManagement from "./pages/GroupManagement";
import YieldManagement from "./pages/YieldManagement";
import Selfmart from "./pages/Selfmart";

// Website pages
import WebsiteLanding from "./pages/website/WebsiteLanding";
import WebsiteFeatures from "./pages/website/WebsiteFeatures";
import RestaurantManagement from "./pages/RestaurantManagement";
import RoomService from "./pages/RoomService";
import SpaWellness from "./pages/SpaWellness";
import DigitalConcierge from "./pages/DigitalConcierge";
import TransferFleet from "./pages/TransferFleet";
import CompetitiveIntelligence from "./pages/CompetitiveIntelligence";
import Guest360Analytics from "./pages/Guest360Analytics";
import RevenueAttribution from "./pages/RevenueAttribution";
import AuditTrail from "./pages/AuditTrail";
import FranchiseManagement from "./pages/FranchiseManagement";
import BusinessContinuity from "./pages/BusinessContinuity";
import WebsitePricing from "./pages/website/WebsitePricing";
import WebsiteScreenshots from "./pages/website/WebsiteScreenshots";
import WebsiteVideos from "./pages/website/WebsiteVideos";
import WebsiteContact from "./pages/website/WebsiteContact";
import WebsiteAbout from "./pages/website/WebsiteAbout";
import WebsiteBlog from "./pages/website/WebsiteBlog";
import WebsiteCareers from "./pages/website/WebsiteCareers";
import WebsitePartners from "./pages/website/WebsitePartners";
import WebsiteHelp from "./pages/website/WebsiteHelp";
import WebsiteDocs from "./pages/website/WebsiteDocs";
import WebsiteAPI from "./pages/website/WebsiteAPI";
import WebsiteStatus from "./pages/website/WebsiteStatus";
import WebsiteCommunity from "./pages/website/WebsiteCommunity";
import WebsitePrivacy from "./pages/website/WebsitePrivacy";
import WebsiteTerms from "./pages/website/WebsiteTerms";
import WebsiteCookies from "./pages/website/WebsiteCookies";
import WebsiteLGPD from "./pages/website/WebsiteLGPD";
import Sitemap from "./pages/Sitemap";
import KioskAI from "./pages/KioskAI";

const queryClient = new QueryClient();

const isPdvUser = (user: any): boolean => {
  const groupName = (user?.group?.name || "").toString().toLowerCase();
  // Strict identification: only by group name.
  // (Do NOT infer from permissions, because admin users may also have pos-terminal access.)
  return (
    groupName.includes("pdv") ||
    groupName.includes("pos terminal") ||
    groupName.includes("pos-terminal")
  );
};

function DashboardRouteDispatcher() {
  const { user } = useAuth();
  if (isPdvUser(user)) return <Navigate to="/dashboard-pdv" replace />;
  return <Index />;
}

function DashboardPDVGuard() {
  const { user } = useAuth();
  if (!isPdvUser(user)) return <Navigate to="/dashboard" replace />;
  return <DashboardPDV />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <InstallPrompt />
        <BrowserRouter>
          <ScrollToTop />
          <GuestAuthProvider>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/login" element={<Auth />} />

              {/* Guest Portal Routes */}
              <Route path="/guest-portal/login" element={<GuestPortalLogin />} />
              <Route path="/guest-portal/reset-password" element={<GuestPortalResetPassword />} />
              <Route path="/guest-portal" element={
                <ProtectedGuestRoute>
                  <GuestPortal />
                </ProtectedGuestRoute>
              } />

              {/* Website Routes (Públicas) - URLs diretas */}
              <Route path="/features" element={<WebsiteFeatures />} />
              <Route path="/pricing" element={<WebsitePricing />} />
              <Route path="/screenshots" element={<WebsiteScreenshots />} />
              <Route path="/videos" element={<WebsiteVideos />} />
              <Route path="/contato" element={<WebsiteContact />} />
              <Route path="/sobre-nos" element={<WebsiteAbout />} />
              <Route path="/blog" element={<WebsiteBlog />} />
              <Route path="/carreiras" element={<WebsiteCareers />} />
              <Route path="/parceiros" element={<WebsitePartners />} />
              <Route path="/central-de-ajuda" element={<WebsiteHelp />} />
              <Route path="/documentacao" element={<WebsiteDocs />} />
              <Route path="/api" element={<WebsiteAPI />} />
              <Route path="/status" element={<WebsiteStatus />} />
              <Route path="/comunidade" element={<WebsiteCommunity />} />
              <Route path="/privacidade" element={<WebsitePrivacy />} />
              <Route path="/termos-de-uso" element={<WebsiteTerms />} />
              <Route path="/cookies" element={<WebsiteCookies />} />
              <Route path="/lgpd" element={<WebsiteLGPD />} />

              {/* Compatibilidade com rotas antigas /website/* */}
              <Route path="/website" element={<Navigate to="/" replace />} />
              <Route path="/website/features" element={<Navigate to="/features" replace />} />
              <Route path="/website/pricing" element={<Navigate to="/pricing" replace />} />
              <Route path="/website/screenshots" element={<Navigate to="/screenshots" replace />} />
              <Route path="/website/videos" element={<Navigate to="/videos" replace />} />
              <Route path="/website/contact" element={<Navigate to="/contato" replace />} />
              <Route path="/website/about" element={<Navigate to="/sobre-nos" replace />} />
              <Route path="/website/blog" element={<Navigate to="/blog" replace />} />
              <Route path="/website/careers" element={<Navigate to="/carreiras" replace />} />
              <Route path="/website/partners" element={<Navigate to="/parceiros" replace />} />
              <Route path="/website/help" element={<Navigate to="/central-de-ajuda" replace />} />
              <Route path="/website/docs" element={<Navigate to="/documentacao" replace />} />
              <Route path="/website/api" element={<Navigate to="/api" replace />} />
              <Route path="/website/status" element={<Navigate to="/status" replace />} />
              <Route path="/website/community" element={<Navigate to="/comunidade" replace />} />
              <Route path="/website/privacy" element={<Navigate to="/privacidade" replace />} />
              <Route path="/website/terms" element={<Navigate to="/termos-de-uso" replace />} />
              <Route path="/website/cookies" element={<Navigate to="/cookies" replace />} />
              <Route path="/website/lgpd" element={<Navigate to="/lgpd" replace />} />

              {/* SEO Routes */}
              <Route path="/sitemap.xml" element={<Sitemap />} />

              {/* Root Route - Website público */}
              <Route path="/" element={<WebsiteLanding />} />

              {/* Rotas Protegidas */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardRouteDispatcher /></ProtectedRoute>} />
              <Route path="/dashboard-pdv" element={<ProtectedRoute><DashboardPDVGuard /></ProtectedRoute>} />
              <Route path="/multi-property" element={<ProtectedRoute><MultiProperty /></ProtectedRoute>} />
              <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
              <Route path="/rooms" element={<ProtectedRoute><RoomMap /></ProtectedRoute>} />
              <Route path="/guests" element={<ProtectedRoute><Guests /></ProtectedRoute>} />
              <Route path="/occupancy-map" element={<ProtectedRoute><OccupancyMap /></ProtectedRoute>} />
              <Route path="/pricing-map" element={<ProtectedRoute><PricingMap /></ProtectedRoute>} />
              <Route path="/financial" element={<ProtectedRoute><Financial /></ProtectedRoute>} />
              <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
              <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
              <Route path="/registrations" element={<ProtectedRoute><Registrations /></ProtectedRoute>} />
              <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
              <Route path="/ai" element={<ProtectedRoute><AIAutomation /></ProtectedRoute>} />
              <Route path="/ai-automation" element={<ProtectedRoute><AIAutomation /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/booking-engine" element={<BookingEngine />} />
              <Route path="/dayuse-engine" element={<ProtectedRoute><DayUseEngine /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute requiredPermission="users"><Users /></ProtectedRoute>} />
              <Route path="/user-groups" element={<ProtectedRoute requiredPermission="user-groups"><UserGroups /></ProtectedRoute>} />
              <Route path="/governanca" element={<ProtectedRoute><Governanca /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/hybrid-properties" element={<ProtectedRoute><HybridProperties /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/night-audit" element={<ProtectedRoute><NightAudit /></ProtectedRoute>} />
              <Route path="/pos" element={<ProtectedRoute><POSIntegration /></ProtectedRoute>} />
              <Route path="/pos-terminal" element={<ProtectedRoute><POSTerminal /></ProtectedRoute>} />
              <Route path="/rate-plans" element={<ProtectedRoute><RatePlans /></ProtectedRoute>} />
              <Route path="/groups" element={<ProtectedRoute><GroupManagement /></ProtectedRoute>} />
              <Route path="/loyalty" element={<ProtectedRoute><LoyaltyProgram /></ProtectedRoute>} />
              <Route path="/communication" element={<ProtectedRoute><CommunicationHub /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AdvancedAnalytics /></ProtectedRoute>} />
              <Route path="/forecast" element={<ProtectedRoute><RevenueForecast /></ProtectedRoute>} />
              <Route path="/yield" element={<ProtectedRoute><YieldManagement /></ProtectedRoute>} />
              <Route path="/selfmart" element={<ProtectedRoute><Selfmart /></ProtectedRoute>} />

              {/* Food & Beverage */}
              <Route path="/restaurants" element={<ProtectedRoute><RestaurantManagement /></ProtectedRoute>} />
              <Route path="/room-service" element={<ProtectedRoute><RoomService /></ProtectedRoute>} />
              <Route path="/banquets" element={<ProtectedRoute><BanquetManagement /></ProtectedRoute>} />

              {/* Wellness & Experiences */}
              <Route path="/spa" element={<ProtectedRoute><SpaWellness /></ProtectedRoute>} />
              <Route path="/concierge" element={<ProtectedRoute><DigitalConcierge /></ProtectedRoute>} />
              <Route path="/transfers" element={<ProtectedRoute><TransferFleet /></ProtectedRoute>} />

              {/* Business Intelligence */}
              <Route path="/competitive" element={<ProtectedRoute><CompetitiveIntelligence /></ProtectedRoute>} />
              <Route path="/guest-360" element={<ProtectedRoute><Guest360Analytics /></ProtectedRoute>} />
              <Route path="/revenue-attribution" element={<ProtectedRoute><RevenueAttribution /></ProtectedRoute>} />

              {/* Enterprise & Compliance */}
              <Route path="/audit" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
              <Route path="/franchise" element={<ProtectedRoute><FranchiseManagement /></ProtectedRoute>} />
              <Route path="/business-continuity" element={<ProtectedRoute><BusinessContinuity /></ProtectedRoute>} />

              <Route path="/inventory" element={<ProtectedRoute><InventoryManagement /></ProtectedRoute>} />
              <Route path="/email-marketing" element={<ProtectedRoute><EmailMarketing /></ProtectedRoute>} />
              <Route path="/workflows" element={<ProtectedRoute><Workflow /></ProtectedRoute>} />
              <Route path="/auto-checkin" element={<ProtectedRoute><AutoCheckIn /></ProtectedRoute>} />
              <Route path="/kiosk-ai" element={<ProtectedRoute><KioskAI /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute><PreventiveMaintenance /></ProtectedRoute>} />
              <Route path="/energy" element={<ProtectedRoute><EnergyManagement /></ProtectedRoute>} />
              <Route path="/install" element={<ProtectedRoute><Install /></ProtectedRoute>} />
              <Route path="/setup-wizard" element={<ProtectedRoute><SetupWizard /></ProtectedRoute>} />
              <Route path="/setup-progress" element={<ProtectedRoute><SetupProgress /></ProtectedRoute>} />
              {/* <Route path="/admin/pages" element={<ProtectedRoute><PageManagement /></ProtectedRoute>} /> Moved to UserGroups modal */}

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </GuestAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
