import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface ChatResource {
  id: string;
  name: string;
  category?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  website?: string;
  lat?: number;
  lng?: number;
}

interface ChatContextType {
  open: boolean;
  setOpen: (v: boolean) => void;
  resource: ChatResource | null;
  setResource: (r: ChatResource | null) => void;
  initialQuestion: string | null;
  setInitialQuestion: (q: string | null) => void;
  openWith: (opts: { resource: ChatResource; initialQuestion?: string }) => void;
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [resource, setResource] = useState<ChatResource | null>(null);
  const [initialQuestion, setInitialQuestion] = useState<string | null>(null);
  const [apiKey, _setApiKey] = useState<string | null>(() => {
    try {
      return localStorage.getItem("perplexity_api_key");
    } catch {
      return null;
    }
  });

  const setApiKey = (key: string | null) => {
    _setApiKey(key);
    try {
      if (key) localStorage.setItem("perplexity_api_key", key);
      else localStorage.removeItem("perplexity_api_key");
    } catch {}
  };

  const openWith: ChatContextType["openWith"] = ({ resource, initialQuestion }) => {
    setResource(resource);
    setInitialQuestion(initialQuestion ?? null);
    setOpen(true);
  };

  const value = useMemo(
    () => ({ open, setOpen, resource, setResource, initialQuestion, setInitialQuestion, openWith, apiKey, setApiKey }),
    [open, resource, initialQuestion, apiKey]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
};
