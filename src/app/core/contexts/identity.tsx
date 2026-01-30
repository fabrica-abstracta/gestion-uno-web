import { createContext, useContext, useEffect, useState } from "react";
import api from "../config/axios";

export interface Account {
  document?: string;
  paternalName?: string;
  maternalName?: string;
  names?: string;
  email: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface IdentityCtx {
  account: Account | null;
  isAuth: boolean;
  loading: boolean;
  signIn: (payload: SignInRequest) => Promise<void>;
  signUp: (payload: SignUpRequest) => Promise<void>;
  logout: () => Promise<void>;
  setAccount: (account: Account | null) => void;
}

const IdentityContext = createContext<IdentityCtx | undefined>(undefined);

export function Identity({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("account");
    if (saved && saved !== "undefined") {
      try {
        setAccount(JSON.parse(saved));
      } catch (error) {
        localStorage.removeItem("account");
        setAccount(null);
      }
    }
    setLoading(false);
  }, []);

  const isAuth = !!account;

  const signIn = async (payload: SignInRequest) => {
    const res = await api.post("/sign-in", payload);
    const acc = res.data.account;
    setAccount(acc);
    localStorage.setItem("account", JSON.stringify(acc));
  };

  const signUp = async (payload: SignUpRequest) => {
    const res = await api.post("/sign-up", payload);
    const acc = res.data.account;
    setAccount(acc);
    localStorage.setItem("account", JSON.stringify(acc));
  };

  const logout = async () => {
    try {
      await api.get("/logout");
      setAccount(null);
      localStorage.removeItem("account");
    } catch (error) {
      setAccount(null);
      localStorage.removeItem("account");
    }
  };

  return (
    <IdentityContext.Provider
      value={{ account, isAuth, loading, signIn, signUp, logout, setAccount }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used within an Identity");
  return ctx;
}