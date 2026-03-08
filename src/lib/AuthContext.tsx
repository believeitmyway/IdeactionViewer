"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGoogleLogin } from "@react-oauth/google";

const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

interface AuthContextType {
  isSignedIn: boolean;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  isGapiLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);

  useEffect(() => {
    // Load gapi script dynamically
    const loadGapi = () => {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => {
        window.gapi.load("client:picker", () => {
          setIsGapiLoaded(true);
        });
      };
      document.body.appendChild(script);
    };

    if (!window.gapi) {
      loadGapi();
    } else {
      // Avoid calling setState synchronously in an effect
      setTimeout(() => setIsGapiLoaded(true), 0);
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      setIsSignedIn(true);

      // Initialize gapi client with the access token
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken({ access_token: tokenResponse.access_token });
        // Optionally load the drive discovery doc if needed for API calls later
        // window.gapi.client.init({
        //   apiKey: API_KEY,
        //   discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        // });
      }
    },
    scope: SCOPES,
    onError: (error) => console.error("Login Failed:", error),
  });

  const logout = () => {
    setAccessToken(null);
    setIsSignedIn(false);
    if (window.gapi && window.gapi.client) {
      window.gapi.client.setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, accessToken, login, logout, isGapiLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
