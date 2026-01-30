import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface StorageCtx {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
  clear: () => void;
  store: Record<string, string>;
}

const StorageContext = createContext<StorageCtx | undefined>(undefined);

export const Storage = ({ children }: { children: ReactNode }) => {
  const [store, setStore] = useState<Record<string, string>>({});

  useEffect(() => {
    const all: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) all[k] = localStorage.getItem(k) || "";
    }
    setStore(all);
  }, []);

  useEffect(() => {
    const onChange = (e: StorageEvent) =>
      e.key
        ? setStore((s) => ({ ...s, [e.key!]: e.newValue ?? "" }))
        : setStore({});
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);

  const getItem = (k: string) => localStorage.getItem(k);
  const setItem = (k: string, v: string) => (
    localStorage.setItem(k, v), setStore((s) => ({ ...s, [k]: v }))
  );
  const removeItem = (k: string) => (
    localStorage.removeItem(k),
    setStore((s) => {
      const { [k]: _, ...r } = s;
      return r;
    })
  );
  const clear = () => (localStorage.clear(), setStore({}));

  return (
    <StorageContext.Provider
      value={{ getItem, setItem, removeItem, clear, store }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error("useStorage must be used within a Storage");
  return ctx;
};
