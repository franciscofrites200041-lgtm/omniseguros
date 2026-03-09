"use client";

import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/lib/types";
import { sendChatMessage } from "@/lib/api";

export function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "¡Hola! Soy tu asistente de seguros. Podés preguntarme sobre vencimientos, estados de pólizas, montos pendientes y más. ¿En qué puedo ayudarte?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector(
                "[data-radix-scroll-area-viewport]"
            );
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content: trimmed,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await sendChatMessage(trimmed);
            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: response,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: "assistant",
                content: "Ocurrió un error. Por favor, intentá de nuevo.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${isOpen
                        ? "rotate-0 bg-zinc-800 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
            >
                {isOpen ? (
                    <X className="h-5 w-5" />
                ) : (
                    <MessageCircle className="h-5 w-5" />
                )}
            </button>

            {/* Chat Panel */}
            <div
                className={`fixed bottom-24 right-6 z-50 w-[380px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all duration-300 ${isOpen
                        ? "translate-y-0 scale-100 opacity-100"
                        : "pointer-events-none translate-y-4 scale-95 opacity-0"
                    }`}
            >
                {/* Chat Header */}
                <div className="border-b border-zinc-100 bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">
                                Asistente de Seguros
                            </p>
                            <p className="text-xs text-blue-100">Powered by n8n + IA</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <ScrollArea className="h-[360px] px-4 py-3" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""
                                    }`}
                            >
                                <div
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${msg.role === "user"
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-zinc-100 text-zinc-500"
                                        }`}
                                >
                                    {msg.role === "user" ? (
                                        <User className="h-3.5 w-3.5" />
                                    ) : (
                                        <Bot className="h-3.5 w-3.5" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[260px] rounded-2xl px-3.5 py-2.5 ${msg.role === "user"
                                            ? "bg-blue-600 text-white"
                                            : "bg-zinc-100 text-zinc-800"
                                        }`}
                                >
                                    <p className="text-[13px] leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex items-start gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                                    <Bot className="h-3.5 w-3.5" />
                                </div>
                                <div className="rounded-2xl bg-zinc-100 px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input */}
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2 border-t border-zinc-100 bg-zinc-50/50 px-4 py-3"
                >
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribí tu consulta..."
                        disabled={isLoading}
                        className="border-zinc-200 bg-white text-sm focus-visible:ring-blue-500"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="h-9 w-9 shrink-0 bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </>
    );
}
