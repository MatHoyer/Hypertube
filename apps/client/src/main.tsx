import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { GlobalAlertDialog } from "./components/dialogs/GlobalAlertDialog.tsx";
import { GlobalDialog } from "./components/dialogs/GlobalDialog.tsx";
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
        <NuqsAdapter>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <App />
            <GlobalDialog />
            <GlobalAlertDialog />
            <Toaster richColors />
            <TailwindIndicator />
          </ThemeProvider>
        </NuqsAdapter>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
