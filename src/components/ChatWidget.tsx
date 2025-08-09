import React, { useMemo, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, MessageSquare, X } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! How can I help you find support today?" },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    // Simulated assistant response
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", content: cannedReply(text) }]);
    }, 400);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-[min(360px,92vw)]">
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
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend} aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Button
        aria-label="Open chat"
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <MessageSquare className="mr-2 h-4 w-4" /> Chat
      </Button>
    </>
  );
}
