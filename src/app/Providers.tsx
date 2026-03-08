"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/lib/AuthContext";
import { SettingsProvider, useSettings } from "@/lib/SettingsContext";
import SettingsModal from "@/components/SettingsModal";
import { useState } from "react";

function OAuthWrapper({ children }: { children: React.ReactNode }) {
  const { settings, isLoaded } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!isLoaded) {
    return null; // Wait until local storage is loaded
  }

  const clientId = settings.clientId;
  const isSettingsComplete = Boolean(settings.clientId && settings.apiKey);

  if (!isSettingsComplete) {
    return (
      <SettingsModal
        isOpen={true}
        onClose={() => {}}
        forceOpen={true}
      />
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        {children}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <OAuthWrapper>{children}</OAuthWrapper>
    </SettingsProvider>
  );
}
