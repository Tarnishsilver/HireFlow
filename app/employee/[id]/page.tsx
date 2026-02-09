"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import {
    Loader2,
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Building2,
    User,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Download,
    Pencil,
    Trash2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Helper to format date
const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export default function EmployeeDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, signOut, loading: authLoading } = useAuth();
    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchEmployee() {
            if (!id) return;
            try {
                const res = await fetch(`/api/employees/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setEmployee(data.employee);
                } else {
                    setError("Failed to load employee details");
                }
            } catch (err) {
                setError("An error occurred");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchEmployee();
    }, [id]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !employee) {
        return (
            <MainLayout user={user} onSignIn={() => { }} onSignOut={signOut}>
                <div className="flex flex-col items-center justify-center h-[80vh]">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
                    <p className="text-muted-foreground mb-4">{error || "Employee not found"}</p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </MainLayout>
        );
    }

    const initials = `${employee.first_name[0]}${employee.last_name[0]}`;
    const fullName = `${employee.first_name} ${employee.last_name}`;
    const latestReview = employee.performance_reviews?.[0];
    const latestPayroll = employee.payroll?.[0];

    return (
        <MainLayout user={user} onSignIn={() => { }} onSignOut={signOut}>
            <div className="bg-gray-50/50 dark:bg-background min-h-full p-6 space-y-6">
                {/* Header / Nav */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Employee Profile</h1>
                        <p className="text-muted-foreground text-sm">View and manage employee details</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" /> Export Report
                        </Button>
                        <Button variant="default" size="sm">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Profile Header Card */}
                <Card className="border-none shadow-sm bg-white dark:bg-card">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-card shadow-sm">
                                <AvatarImage src="" />
                                <AvatarFallback className={`${employee.avatar_color || 'bg-blue-500'} text-white text-2xl`}>
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold">{fullName}</h2>
                                    <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'} className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                                        Active
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" /> {employee.job_title} at {employee.department?.name}
                                </p>
                                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-4 w-4" /> {employee.email}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4" /> {employee.phone || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4" /> New York, USA (Remote)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="payroll">Payroll</TabsTrigger>
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                    </TabsList>

                    {/* Overview Content */}
                    <TabsContent value="overview" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Employment Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" /> Employment Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Date of Joining</p>
                                            <p className="font-medium">{formatDate(employee.created_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Employment Type</p>
                                            <p className="font-medium">{employee.contract_type}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Reporting Manager</p>
                                            <p className="font-medium text-primary hover:underline cursor-pointer">
                                                {employee.manager ? `${employee.manager.first_name} ${employee.manager.last_name}` : 'None'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Work Schedule</p>
                                            <p className="font-medium">Mon-Fri (9AM - 5PM)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Attendance & Leave Quick View */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" /> Attendance & Leave
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Leave Balance</p>
                                            <p className="text-xs text-muted-foreground">Annual Leave</p>
                                        </div>
                                        <div className="text-2xl font-bold text-primary">12 <span className="text-sm font-normal text-muted-foreground">days</span></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium mb-2">Recent Activity</p>
                                        <div className="space-y-2">
                                            {employee.leaves?.length > 0 ? employee.leaves.map((leave: any) => (
                                                <div key={leave.id} className="flex justify-between text-sm items-center border-b pb-2 last:border-0 last:pb-0">
                                                    <span className="text-muted-foreground">{leave.type}</span>
                                                    <Badge variant="outline" className={
                                                        leave.status === 'Approved' ? 'text-green-600 border-green-200 bg-green-50' :
                                                            leave.status === 'Pending' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' : ''
                                                    }>{leave.status}</Badge>
                                                </div>
                                            )) : <p className="text-sm text-muted-foreground">No recent leave requests.</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Performance Content */}
                    <TabsContent value="performance" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Performance Review</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {latestReview ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Latest Rating</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-4xl font-bold">{latestReview.rating.toFixed(1)}</span>
                                                        <div className="flex text-yellow-500">
                                                            {'★'.repeat(Math.round(latestReview.rating))}
                                                            {'☆'.repeat(5 - Math.round(latestReview.rating))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-muted-foreground">Review Date</p>
                                                    <p className="font-medium">{formatDate(latestReview.review_date)}</p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div>
                                                <h4 className="font-semibold mb-2">Manager Comments</h4>
                                                <p className="text-sm text-muted-foreground italic">"{latestReview.comments}"</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-muted/30 p-4 rounded-lg">
                                                    <p className="text-sm text-muted-foreground">KPIs Assigned</p>
                                                    <p className="text-xl font-bold">{latestReview.kpis_assigned}</p>
                                                </div>
                                                <div className="bg-muted/30 p-4 rounded-lg">
                                                    <p className="text-sm text-muted-foreground">KPIs Achieved</p>
                                                    <p className="text-xl font-bold">{latestReview.kpis_achieved}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-muted-foreground">
                                            No performance reviews found.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Payroll Content */}
                    <TabsContent value="payroll" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Salary & Compensation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {latestPayroll ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-4 border rounded-lg bg-card">
                                            <p className="text-sm text-muted-foreground mb-1">Monthly Salary</p>
                                            <p className="text-2xl font-bold">{latestPayroll.currency} {latestPayroll.salary.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 border rounded-lg bg-card">
                                            <p className="text-sm text-muted-foreground mb-1">Pay Frequency</p>
                                            <p className="text-lg font-medium">{latestPayroll.pay_frequency}</p>
                                        </div>
                                        <div className="p-4 border rounded-lg bg-card">
                                            <p className="text-sm text-muted-foreground mb-1">Effective Date</p>
                                            <p className="text-lg font-medium">{formatDate(latestPayroll.effective_date)}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        No payroll information available.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Projects Content */}
                    <TabsContent value="projects" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {employee.projects?.length > 0 ? employee.projects.map((ep: any) => (
                                <Card key={ep.project_id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{ep.project.name}</CardTitle>
                                            <Badge variant={ep.project.status === 'Active' ? 'default' : 'secondary'}>
                                                {ep.project.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">{ep.project.description}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="bg-muted px-2 py-1 rounded text-xs font-medium">
                                                Role: {ep.role}
                                            </span>
                                            <span className="text-muted-foreground">
                                                Since {formatDate(ep.joined_at)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : (
                                <div className="col-span-full text-center py-10 text-muted-foreground">
                                    No active projects assigned.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
