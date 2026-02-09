"use client";

import { useState, useEffect } from "react";
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import {
    Loader2,
    Megaphone,
    MessageSquare,
    Bell,
    Plus,
    Search,
    User,
    Send
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assume this exists or use div

export default function CommunicationPage() {
    const { user, signOut, loading: authLoading } = useAuth();
    const [data, setData] = useState<any>({ announcements: [], messages: [], notifications: [] });
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Chat State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [messageInput, setMessageInput] = useState("");
    const [activeMessages, setActiveMessages] = useState<any[]>([]);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch basic communication data (Announcements/Notifs)
                // We wrap in try/catch independently so one failure doesn't block the UI
                try {
                    const res = await fetch('/api/communication');
                    if (res.ok) {
                        const json = await res.json();
                        setData(json);
                    }
                } catch (e) {
                    console.error("Failed to fetch communication stats", e);
                }

                // Fetch Employees for Chat
                try {
                    const empRes = await fetch('/api/employees');
                    if (empRes.ok) {
                        const empJson = await empRes.json();
                        setEmployees(empJson.employees || []);
                    }
                } catch (e) {
                    console.error("Failed to fetch employees", e);
                }

            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Filter employees for sidebar
    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageInput.trim() || !selectedUser) return;

        const newMessage = {
            id: Date.now().toString(),
            content: messageInput,
            sender_id: user?.uid,
            created_at: new Date().toISOString(),
            sender: {
                first_name: user?.displayName || 'Me',
                avatar_color: 'bg-blue-600'
            }
        };

        setActiveMessages(prev => [...prev, newMessage]);
        setMessageInput("");

        // In a real app, we would POST to /api/communication here
        // API call is optimistic for now
    };

    const handleSelectUser = (emp: any) => {
        setSelectedUser(emp);
        // In a real app, we'd fetch chat history for this user here.
        // For now, we just clear/mock
        setActiveMessages([]);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <MainLayout user={user} onSignIn={() => { }} onSignOut={signOut}>
            <div className="p-6 space-y-6 h-[calc(100vh-4rem)] flex flex-col">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Communication Center</h1>
                        <p className="text-muted-foreground">Manage announcements, messages, and notifications.</p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Announcement
                    </Button>
                </div>

                <Tabs defaultValue="messages" className="flex-1 flex flex-col">
                    <TabsList>
                        <TabsTrigger value="messages">
                            <MessageSquare className="mr-2 h-4 w-4" /> Messages
                        </TabsTrigger>
                        <TabsTrigger value="announcements">
                            <Megaphone className="mr-2 h-4 w-4" /> Announcements
                        </TabsTrigger>
                        <TabsTrigger value="notifications">
                            <Bell className="mr-2 h-4 w-4" /> Notifications
                        </TabsTrigger>
                    </TabsList>

                    {/* MESSAGES TAB */}
                    <TabsContent value="messages" className="flex-1 flex gap-4 h-full mt-4 min-h-[500px] overflow-hidden">
                        {/* Sidebar: User Search */}
                        <Card className="w-1/3 flex flex-col">
                            <div className="p-4 border-b">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search employees..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-2 space-y-1">
                                    {filteredEmployees.map((emp) => (
                                        <div
                                            key={emp.id}
                                            onClick={() => handleSelectUser(emp)}
                                            className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-muted transition-colors ${selectedUser?.id === emp.id ? 'bg-muted' : ''}`}
                                        >
                                            <Avatar className={emp.avatar?.includes('bg-') ? emp.avatar : ''}>
                                                <AvatarFallback className={emp.avatar}>{emp.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-medium truncate">{emp.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{emp.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredEmployees.length === 0 && (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No employees found.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </Card>

                        {/* Chat Area */}
                        <Card className="flex-1 flex flex-col">
                            {selectedUser ? (
                                <>
                                    <div className="p-4 border-b flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{selectedUser.name}</p>
                                                <p className="text-xs text-muted-foreground">{selectedUser.department}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <ScrollArea className="flex-1 p-4">
                                        <div className="space-y-4">
                                            {activeMessages.length === 0 ? (
                                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm opacity-50 mt-20">
                                                    Start a conversation with {selectedUser.name}
                                                </div>
                                            ) : (
                                                activeMessages.map((msg: any) => (
                                                    <div key={msg.id} className={`flex gap-3 ${msg.sender_id === user?.uid ? 'flex-row-reverse' : ''}`}>
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className={msg.sender?.avatar_color}>{msg.sender?.first_name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className={`rounded-lg p-3 max-w-[70%] text-sm ${msg.sender_id === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                            <p>{msg.content}</p>
                                                            <span className="text-[10px] opacity-70 block mt-1 text-right">
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>

                                    <div className="p-4 border-t bg-background">
                                        <form className="flex gap-2" onSubmit={handleSendMessage}>
                                            <Input
                                                placeholder={`Message ${selectedUser.name.split(' ')[0]}...`}
                                                className="flex-1"
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                            />
                                            <Button type="submit" size="icon" disabled={!messageInput.trim()}>
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                    <MessageSquare className="h-12 w-12 opacity-20 mb-4" />
                                    <p>Select an employee to start chatting</p>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="announcements" className="mt-4 flex-1">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {data.announcements.map((ann: any) => (
                                <Card key={ann.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant={ann.priority === 'High' ? 'destructive' : 'secondary'}>
                                                {ann.priority}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(ann.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <CardTitle className="mt-2 text-lg">{ann.title}</CardTitle>
                                        <CardDescription>{ann.type} Announcement</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {ann.content}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                            {data.announcements.length === 0 && (
                                <div className="col-span-full text-center p-8 text-muted-foreground">
                                    No announcements yet.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Notifications</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.notifications.map((notif: any) => (
                                    <div key={notif.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                        <div className={`p-2 rounded-full ${notif.type === 'Leave' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{notif.title}</h4>
                                            <p className="text-sm text-muted-foreground">{notif.message}</p>
                                            <span className="text-xs text-muted-foreground mt-1 block">
                                                {new Date(notif.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        {notif.link && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={notif.link}>View</a>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
