import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const DEFAULT_OPENAI_API_KEY = "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";

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
      const stored = localStorage.getItem("openai_api_key");
      return stored || DEFAULT_OPENAI_API_KEY;
    } catch {
      return DEFAULT_OPENAI_API_KEY;
    }
  });

  const setApiKey = (key: string | null) => {
    _setApiKey(key);
    try {
      if (key) localStorage.setItem("openai_api_key", key);
      else localStorage.removeItem("openai_api_key");
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
