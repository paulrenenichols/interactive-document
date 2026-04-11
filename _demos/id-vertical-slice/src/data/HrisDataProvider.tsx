import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadHrisCsv, type HrisRow } from "./hris";

export interface HrisDataContextValue {
  rows: HrisRow[];
  loading: boolean;
  error: string | null;
  rowCount: number;
}

const HrisDataContext = createContext<HrisDataContextValue | null>(null);

export function HrisDataProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<HrisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadHrisCsv()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<HrisDataContextValue>(
    () => ({
      rows,
      loading,
      error,
      rowCount: rows.length,
    }),
    [rows, loading, error],
  );

  return (
    <HrisDataContext.Provider value={value}>{children}</HrisDataContext.Provider>
  );
}

export function useHrisData(): HrisDataContextValue {
  const ctx = useContext(HrisDataContext);
  if (!ctx) {
    throw new Error("useHrisData must be used within HrisDataProvider");
  }
  return ctx;
}
