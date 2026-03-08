"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface Settings {
  clientId: string;
  apiKey: string;
}

interface SettingsContextType {
  settings: Settings;
  saveSettings: (newSettings: Settings) => void;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({ clientId: "", apiKey: "" });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from local storage on mount
    const storedSettings = localStorage.getItem("drive-md-viewer-settings");
    setTimeout(() => {
      if (storedSettings) {
        try {
          setSettings(JSON.parse(storedSettings));
        } catch (e) {
          console.error("Failed to parse settings from local storage", e);
        }
      }
      setIsLoaded(true);
    }, 0);
  }, []);

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem("drive-md-viewer-settings", JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
