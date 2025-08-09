import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HelpCenter from "./pages/HelpCenter";
import NotFound from "./pages/NotFound";
import ChatWidget from "./components/ChatWidget";
import HeaderNav from "./components/HeaderNav";
import { GoogleMapsProvider } from "./hooks/useGoogleMaps";
import { ChatProvider } from "./context/ChatContext";
import { LanguageProvider } from "./context/LanguageContext";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <GoogleMapsProvider apiKey="AIzaSyDU4S7X8HQy4-T0JKL66E54BXoBo8yiy9k">
        <ChatProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ChatWidget />
            <BrowserRouter>
              <HeaderNav />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/help" element={<HelpCenter />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </GoogleMapsProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
