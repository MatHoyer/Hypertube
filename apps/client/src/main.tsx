import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { TailwindIndicator } from "./components/TailwindIndicator.tsx";
import { ThemeProvider } from "./components/theme/ThemeProvider.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import "./index.css";
import "./lib/i18n/i18n.ts";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <App />
          <Toaster />
          <TailwindIndicator />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
