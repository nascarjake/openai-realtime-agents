"use client";

import React, { createContext, useContext, useState } from "react";

type UIMode = "standard" | "simple";

interface UIModeContextType {
  mode: UIMode;
  toggleMode: () => void;
  setMode: (mode: UIMode) => void;
}

const UIModeContext = createContext<UIModeContextType | undefined>(undefined);

export function UIModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<UIMode>("standard");

  const toggleMode = () => {
    setMode(mode === "standard" ? "simple" : "standard");
  };

  return (
    <UIModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </UIModeContext.Provider>
  );
}

export function useUIMode() {
  const context = useContext(UIModeContext);
  if (context === undefined) {
    throw new Error("useUIMode must be used within a UIModeProvider");
  }
  return context;
} 