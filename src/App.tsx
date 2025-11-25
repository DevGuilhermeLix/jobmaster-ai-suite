import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CriarCurriculo from "./pages/CriarCurriculo";
import AnalisarVaga from "./pages/AnalisarVaga";
import Entrevista from "./pages/Entrevista";
import Ranking from "./pages/Ranking";
import Conta from "./pages/Conta";
import Historico from "./pages/Historico";
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
          <Route path="/criar-curriculo" element={<CriarCurriculo />} />
          <Route path="/analisar-vaga" element={<AnalisarVaga />} />
          <Route path="/entrevista" element={<Entrevista />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/conta" element={<Conta />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
