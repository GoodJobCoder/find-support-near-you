import React, { useMemo, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, MessageSquare, X } from "lucide-react";
import { useChat } from "@/context/ChatContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const cannedReply = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes("hour") || t.includes("open")) {
    return "Hours can vary by location. Please use the Call or Website buttons in the details to confirm timing.";
  }
  if (t.includes("insurance") || t.includes("cost") || t.includes("price")) {
    return "Coverage and costs differ by provider. We recommend calling the organization directly to verify options.";
  }
  if (t.includes("direction") || t.includes("where") || t.includes("address")) {
    return "Click 'Open in Maps' in the resource details to get turn-by-turn directions.";
  }
  if (t.includes("category") || t.includes("support") || t.includes("treatment")) {
    return "You can filter by Category at the top of the page, then set a radius to see nearby options.";
  }
  return "I’m here to help. Ask about finding resources, directions, or how to contact a location.";
};

export default function ChatWidget() {
  const { open, setOpen, resource, apiKey, initialQuestion, setInitialQuestion } = useChat();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! How can I help you find support today?" },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastResourceIdRef = useRef<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open && resource) {
      lastResourceIdRef.current = resource.id;
      const parts = [
        resource.name,
        resource.address,
        [resource.city, resource.state, resource.country].filter(Boolean).join(", "),
        resource.phone ? `Phone: ${resource.phone}` : null,
        resource.website ? `Website: ${resource.website}` : null,
      ].filter(Boolean) as string[];
      setInput("");
      setMessages([
        { role: "assistant", content: "Hi! How can I help you find support today?" },
        { role: "assistant", content: `You opened: ${parts.join(" · ")}. Ask me anything about this location.` },
      ]);
    }
    if (open && initialQuestion) {
      setInput(initialQuestion);
      setInitialQuestion(null);
    }
  }, [open, resource]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");

    // If no API key, fall back to canned reply
    if (!apiKey) {
      setTimeout(() => {
        setMessages((m) => [...m, { role: "assistant", content: cannedReply(text) }]);
      }, 300);
      return;
    }

    try {
      setLoading(true);
      const history = messages;

      const locationContext = resource
        ? `Location context (use when relevant): ${JSON.stringify(resource)}`
        : "";

      const systemPrompt =
        "You are a concise, friendly support assistant. If the user asks about a specific location, use the provided context to answer accurately. Offer practical steps (call, website, directions) and be brief." +
        (locationContext ? `\n${locationContext}` : "");

      const openaiMessages = [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: text },
      ];

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-2025-04-14",
          messages: openaiMessages,
          temperature: 0.2,
          max_tokens: 500,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("OpenAI error:", errText);
        throw new Error("Failed to generate reply");
      }

      const data = await resp.json();
      const output =
        data?.choices?.[0]?.message?.content?.trim() ||
        "Sorry, I couldn't generate a response right now.";

      setMessages((m) => [...m, { role: "assistant", content: output }]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting to the AI service right now. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {open && (
        <div className="pointer-events-auto fixed bottom-20 right-4 z-[60] w-[min(360px,92vw)]">
          <Card className="border border-border/60 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-primary/10">
              <div className="text-sm font-medium">Support Assistant</div>
              <button aria-label="Close chat" onClick={() => setOpen(false)} className="p-1 rounded hover:bg-primary/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-3 space-y-2 bg-background/95">
              {messages.map((m, i) => (
                <div key={i} className={`text-sm ${m.role === "user" ? "text-foreground" : "text-muted-foreground"}`}>
                  <span className={`inline-block px-3 py-2 rounded-md ${m.role === "user" ? "bg-primary/15" : "bg-muted"}`}>
                    {m.content}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-2 border-t flex gap-2">
              <Input
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                disabled={loading}
              />
              <Button onClick={handleSend} aria-label="Send message" disabled={loading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Button
        aria-label="Open chat"
        onClick={() => setOpen(!open)}
        className="pointer-events-auto fixed bottom-4 right-4 z-[50] shadow-lg transform-gpu will-change-transform"
        style={{ 
          position: 'fixed',
          bottom: '1rem',
          right: '1rem'
        }}
      >
        <MessageSquare className="mr-2 h-4 w-4" /> Chat
      </Button>
    </div>
  );
}
