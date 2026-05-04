"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const SUGGESTED = [
  "My lower back is tight today, what should I do?",
  "I've missed three sessions — am I screwed?",
  "What should I eat before training?",
  "I'm travelling this week — what's my hotel workout?",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function EdgePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function loadMessages() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);
    if (data) setMessages(data);
  }

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);

    const tempUser: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: msg,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUser]);

    try {
      const res = await fetch("/api/edge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      setStreaming(" ");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
        setStreaming(full);
      }

      setStreaming("");

      const tempAssistant: Message = {
        id: `temp-a-${Date.now()}`,
        role: "assistant",
        content: full,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempAssistant]);
    } catch {
      setStreaming("");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const isEmpty = messages.length === 0 && !streaming;

  return (
    <div className="flex flex-col h-screen bg-edge-bg max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.08] pt-safe flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-edge-gold flex items-center justify-center">
          <span className="font-condensed font-black text-sm text-edge-bg">E</span>
        </div>
        <div>
          <h1 className="font-condensed font-bold text-lg uppercase tracking-wide leading-none">Edge</h1>
          <p className="text-edge-muted text-xs">Your performance coach</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isEmpty && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-edge-gold/20 flex items-center justify-center mx-auto mb-4">
              <span className="font-condensed font-black text-2xl text-edge-gold">E</span>
            </div>
            <p className="text-white/70 font-body text-sm leading-relaxed mb-6 max-w-xs mx-auto">
              Ask me anything. Training, recovery, nutrition, mindset — or just tell me what's going on.
            </p>
            <div className="space-y-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left bg-edge-surface border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm font-body active:bg-white/5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start gap-2"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-edge-gold flex items-center justify-center flex-shrink-0 mt-1">
                <span className="font-condensed font-black text-xs text-edge-bg">E</span>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-body leading-relaxed ${
                m.role === "user"
                  ? "bg-edge-red text-white rounded-tr-sm"
                  : "bg-edge-surface text-white/90 rounded-tl-sm border border-white/[0.08]"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {streaming && (
          <div className="flex justify-start gap-2">
            <div className="w-7 h-7 rounded-full bg-edge-gold flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-condensed font-black text-xs text-edge-bg">E</span>
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm font-body leading-relaxed bg-edge-surface text-white/90 border border-white/[0.08]">
              {streaming === " " ? (
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="typing-dot w-1.5 h-1.5 rounded-full bg-edge-gold" />
                  ))}
                </div>
              ) : (
                streaming
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/[0.08] bg-edge-surface flex-shrink-0 pb-safe">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Edge..."
            rows={1}
            className="flex-1 bg-edge-bg border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-red resize-none max-h-32"
            style={{ minHeight: "46px" }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-edge-red flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
