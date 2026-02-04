
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnalysisResult {
    username: string;
    platform: string;
    total_posts_analyzed: number;
    profane_ratio: number;
    average_toxicity: number;
    harassment_risk: 'Low' | 'Medium' | 'High';
    posts: {
        text: string;
        toxicity: {
            toxicity: number;
            obscene: number;
        };
    }[];
}

export default function SocialCheck() {
    const [username, setUsername] = useState('');
    const [platform, setPlatform] = useState('twitter');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/social-check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, platform }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze');
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'High': return 'text-red-600 bg-red-100 border-red-200';
            case 'Medium': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'Low': return 'text-green-600 bg-green-100 border-green-200';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Social Media Background Check</CardTitle>
                    <CardDescription>
                        Analyze a public profile for toxicity and profanity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2 col-span-1">
                                <Label htmlFor="platform">Platform</Label>
                                <Select value={platform} onValueChange={setPlatform}>
                                    <SelectTrigger id="platform">
                                        <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="twitter">Twitter / X</SelectItem>
                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    placeholder="e.g. elonmusk"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end col-span-1">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        'Check Profile'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Summary Card */}
                    <Card className="md:col-span-1 border-2 border-indigo-50">
                        <CardHeader className="bg-indigo-50/50">
                            <CardTitle className="text-lg">Risk Assessment</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="flex flex-col items-center justify-center text-center space-y-2">
                                <Badge className={`px-4 py-1.5 text-lg font-semibold border ${getRiskColor(result.harassment_risk)}`}>
                                    {result.harassment_risk} Risk
                                </Badge>
                                {result.harassment_risk === 'Low' ? (
                                    <ShieldCheck className="w-12 h-12 text-green-500" />
                                ) : (
                                    <ShieldAlert className="w-12 h-12 text-red-500" />
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm text-gray-500">Toxicity Score</span>
                                    <span className="font-mono font-medium">{(result.average_toxicity * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm text-gray-500">Profanity Ratio</span>
                                    <span className="font-mono font-medium">{(result.profane_ratio * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm text-gray-500">Posts Analyzed</span>
                                    <span className="font-mono font-medium">{result.total_posts_analyzed}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Posts */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Recent Activity Analysis</CardTitle>
                            <CardDescription>
                                Analysis of the last {result.total_posts_analyzed} public posts found.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result.posts.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No posts content available for display.</p>
                            ) : (
                                result.posts.map((post, idx) => (
                                    <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                                        <p className="text-sm text-gray-800 line-clamp-3">
                                            "{post.text}"
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="outline" className={post.toxicity.toxicity > 0.5 ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}>
                                                Toxicity: {post.toxicity.toxicity.toFixed(2)}
                                            </Badge>
                                            {post.toxicity.obscene === 1 && (
                                                <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                                                    Profane
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
