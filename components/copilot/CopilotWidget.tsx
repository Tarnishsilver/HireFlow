"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export function CopilotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I\'m your HR Copilot. Ask me about payroll, leave stats, or employee details.' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            // Send entire history context
            const res = await fetch('/api/copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] })
            });

            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <Card className="w-[350px] h-[500px] mb-4 shadow-xl border-blue-500/20 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-4 shrink-0">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                <CardTitle className="text-base">HR Copilot</CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white hover:bg-white/20"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-background">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <Avatar className={`h-8 w-8 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gray-200'}`}>
                                            <AvatarFallback className="text-white">
                                                {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : 'me'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={`rounded-lg p-3 text-sm max-w-[80%] ${msg.role === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-muted text-foreground border'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-3">
                                        <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-500">
                                            <AvatarFallback><Bot className="h-4 w-4 text-white" /></AvatarFallback>
                                        </Avatar>
                                        <div className="flex items-center gap-1 rounded-lg p-3 bg-muted h-10 w-16">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-0"></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-3 border-t bg-background shrink-0">
                            <form
                                className="flex gap-2"
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            >
                                <Input
                                    placeholder="Ask about payroll, staff..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon" disabled={!input.trim() || loading}>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Floating Toggle Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-transform duration-200 p-0"
                >
                    <Bot className="h-7 w-7 text-white" />
                </Button>
            )}
        </div>
    );
}
