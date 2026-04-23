import { createContext, useContext, type ReactNode } from "react";

export interface AppDocumentContextValue {
  documentTitle: string;
}

const AppDocumentContext = createContext<AppDocumentContextValue | null>(null);

export function AppDocumentProvider({
  documentTitle,
  children,
}: {
  documentTitle: string;
  children: ReactNode;
}) {
  return (
    <AppDocumentContext.Provider value={{ documentTitle }}>{children}</AppDocumentContext.Provider>
  );
}

export function useAppDocument(): AppDocumentContextValue {
  const ctx = useContext(AppDocumentContext);
  if (!ctx) {
    throw new Error("useAppDocument must be used within AppDocumentProvider");
  }
  return ctx;
}
