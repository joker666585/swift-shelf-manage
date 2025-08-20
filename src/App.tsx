import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PackageEntry from "./pages/PackageEntry";
import PackageList from "./pages/PackageList";
import ShipmentList from "./pages/ShipmentList";
import TrackingQuery from "./pages/TrackingQuery";
import PricingQuery from "./pages/PricingQuery";
import Analytics from "./pages/Analytics";
import ShelfManagement from "./pages/ShelfManagement";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/entry" element={<PackageEntry />} />
          <Route path="/packages" element={<PackageList />} />
          <Route path="/shipments" element={<ShipmentList />} />
          <Route path="/tracking" element={<TrackingQuery />} />
          <Route path="/pricing" element={<PricingQuery />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/shelves" element={<ShelfManagement />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
