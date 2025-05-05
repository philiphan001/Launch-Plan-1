// Import the WebSocket patch first so it's applied before any other code runs
import "./utils/websocket-patch";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";
import { FirebaseAuthProvider } from "./context/FirebaseAuthContext";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <FirebaseAuthProvider>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </FirebaseAuthProvider>
  </QueryClientProvider>
);
