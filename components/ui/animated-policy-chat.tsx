"use client";

import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState, FormEvent } from "react";
import { cn } from "@/lib/utils";
import {
    Paperclip,
    SendIcon,
    XIcon,
    LoaderIcon,
    Bot,
    RefreshCw,
    FileText,
    CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    containerClassName?: string;
    showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, containerClassName, showRing = true, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);

        return (
            <div className={cn(
                "relative",
                containerClassName
            )}>
                <textarea
                    className={cn(
                        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                        "transition-all duration-200 ease-in-out",
                        "placeholder:text-muted-foreground",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
                        className
                    )}
                    ref={ref}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {showRing && isFocused && (
                    <motion.span
                        className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-white/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </div>
        )
    }
)
Textarea.displayName = "Textarea"

interface Message {
    id: number;
    content: string;
    sender: "user" | "ai";
}

function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function AnimatedPolicyChat() {
    const [sessionId, setSessionId] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [value, setValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // File upload state
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSessionId(generateSessionId());
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const askQuestion = async (question: string): Promise<string> => {
        const response = await fetch("/api/policy/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                session_id: sessionId,
                question: question,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.answer;
    };

    const uploadDocument = async (file: File): Promise<boolean> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("company_id", "default");

        const response = await fetch("/api/policy/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        return true;
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                setError("Only PDF files are allowed");
                return;
            }
            setAttachedFile(file);
            setUploadSuccess(false);
            setError(null);
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeAttachedFile = () => {
        setAttachedFile(null);
        setUploadSuccess(false);
    };

    const resetSession = useCallback(async () => {
        setIsLoading(true);
        try {
            const newSessionId = generateSessionId();

            await fetch(`/api/policy/reset?session_id=${encodeURIComponent(newSessionId)}`, {
                method: "POST",
            });

            setSessionId(newSessionId);
            setMessages([]);
            setError(null);
        } catch {
            setError("Failed to reset session. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    const handleSendMessage = async () => {
        if (!value.trim() || isLoading || isUploading) return;

        const userMessage = value.trim();
        const fileToUpload = attachedFile;

        setValue("");
        adjustHeight(true);
        setError(null);

        // Build display message
        const displayMessage = fileToUpload
            ? `📎 ${fileToUpload.name}\n\n${userMessage}`
            : userMessage;

        setMessages((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                content: displayMessage,
                sender: "user",
            },
        ]);

        // Clear attached file after adding to message
        setAttachedFile(null);
        setUploadSuccess(false);
        setIsLoading(true);

        try {
            // If there's a file attached, upload it first
            if (fileToUpload) {
                setIsUploading(true);
                try {
                    await uploadDocument(fileToUpload);
                    setUploadSuccess(true);
                } catch (uploadError) {
                    setError("Failed to upload document. Your question will be answered without the document context.");
                } finally {
                    setIsUploading(false);
                }
            }

            // Then ask the question
            const answer = await askQuestion(userMessage);
            setMessages((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    content: answer,
                    sender: "ai",
                },
            ]);
        } catch {
            setError("Failed to get a response. Please try again.");
            setMessages((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    content: "I'm sorry, I encountered an error while processing your request. Please try again.",
                    sender: "ai",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col w-full bg-black text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
            </div>

            {/* Messages Area */}
            <div className="flex-1 relative z-10 overflow-y-auto">
                {messages.length === 0 && !isLoading ? (
                    /* Welcome Screen - Top positioned with padding */
                    <div className="h-full flex flex-col items-center pt-32 md:pt-40 px-6">
                        <motion.div
                            className="text-center space-y-4 max-w-2xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-block"
                            >
                                <h1 className="text-4xl md:text-5xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 pb-2">
                                    What doubts do you have?
                                </h1>
                                <motion.div
                                    className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mt-4"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "100%", opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                />
                            </motion.div>
                            <motion.p
                                className="text-base text-white/50 mt-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Ask about HR policies, procedures, or guidelines
                            </motion.p>
                        </motion.div>
                    </div>
                ) : (
                    /* Chat Messages */
                    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "flex gap-4",
                                        message.sender === "user" && "flex-row-reverse"
                                    )}
                                >
                                    <div className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                                        message.sender === "user"
                                            ? "bg-white text-black"
                                            : "bg-white/10 text-white border border-white/10"
                                    )}>
                                        {message.sender === "user" ? (
                                            <span className="text-sm font-medium">U</span>
                                        ) : (
                                            <Bot className="h-4 w-4" />
                                        )}
                                    </div>
                                    <motion.div
                                        className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-3",
                                            message.sender === "user"
                                                ? "bg-white text-black"
                                                : "bg-white/[0.05] text-white/90 border border-white/10"
                                        )}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4"
                            >
                                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <div className="bg-white/[0.05] rounded-2xl px-4 py-3 border border-white/10">
                                    <TypingDots />
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-white/40 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="relative z-10 border-t border-white/10 backdrop-blur-xl bg-black/50">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="hidden"
                    />

                    <motion.div
                        className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                    >
                        {/* Attached file preview */}
                        <AnimatePresence>
                            {attachedFile && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="border-b border-white/[0.05]"
                                >
                                    <div className="px-4 py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4 text-white/70" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm text-white/80 truncate">{attachedFile.name}</p>
                                                <p className="text-xs text-white/40">
                                                    {(attachedFile.size / 1024).toFixed(1)} KB • PDF
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            type="button"
                                            onClick={removeAttachedFile}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-1.5 text-white/40 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder={attachedFile ? "Ask about the uploaded document..." : "Ask about company policies..."}
                                containerClassName="w-full"
                                className={cn(
                                    "w-full px-4 py-3",
                                    "resize-none",
                                    "bg-transparent",
                                    "border-none",
                                    "text-white/90 text-sm",
                                    "focus:outline-none",
                                    "placeholder:text-white/20",
                                    "min-h-[60px]"
                                )}
                                style={{
                                    overflow: "hidden",
                                }}
                                showRing={false}
                                disabled={isLoading || isUploading}
                            />
                        </div>

                        <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <motion.button
                                    type="button"
                                    onClick={handleFileSelect}
                                    whileTap={{ scale: 0.94 }}
                                    disabled={isLoading || isUploading}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors relative group",
                                        attachedFile
                                            ? "text-green-400 bg-green-400/10"
                                            : "text-white/40 hover:text-white/90"
                                    )}
                                >
                                    {attachedFile ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Paperclip className="w-4 h-4" />
                                    )}
                                    {/* Tooltip */}
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white/70 bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {attachedFile ? "File attached" : "Attach PDF"}
                                    </span>
                                </motion.button>
                            </div>

                            <motion.button
                                type="button"
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoading || isUploading || !value.trim()}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    "flex items-center gap-2",
                                    value.trim()
                                        ? "bg-white text-black shadow-lg shadow-white/10"
                                        : "bg-white/[0.05] text-white/40"
                                )}
                            >
                                {isLoading || isUploading ? (
                                    <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                                ) : (
                                    <SendIcon className="w-4 h-4" />
                                )}
                                <span>{isUploading ? "Uploading..." : "Send"}</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    <p className="text-center text-xs text-white/30 mt-3">
                        Press Enter to send • Shift+Enter for new line • 📎 Attach PDF documents
                    </p>
                </div>
            </div>

            {/* Mouse follower effect */}
            {inputFocused && (
                <motion.div
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-white via-gray-300 to-white blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                    style={{
                        boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)"
                    }}
                />
            ))}
        </div>
    );
}
