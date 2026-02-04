'use client';

import { MOCK_CANDIDATES } from '@/lib/mock-data/candidates';
import { useDemoStore } from '@/lib/store/useDemoStore';
import { ArrowLeft, Download, Share2, CheckCircle, XCircle, AlertTriangle, MessageSquare, Code2, Brain } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ReportPage() {
    const { id } = useParams();
    const { isAnonymousMode } = useDemoStore();

    // Safe mock lookup
    const candidate = MOCK_CANDIDATES.find(c => c.id === id) || MOCK_CANDIDATES[0];
    const displayName = isAnonymousMode ? candidate.substituteId : candidate.realName;

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Link href="/interview/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Interview Report: {displayName}</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">ID: {candidate.id.toUpperCase()}</span>
                        <span>•</span>
                        <span>Generated on {(new Date()).toLocaleDateString()}</span>
                        <span>•</span>
                        {candidate.risks.plagiarism === 'High' && (
                            <span className="flex items-center gap-1 text-red-600 font-bold">
                                <AlertTriangle className="w-3 h-3" /> Check Plagiarism
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-all">
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md shadow-indigo-100 transition-all active:scale-95">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Summary & Scores */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Executive Summary */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">AI Executive Summary</h3>
                        <p className="text-slate-600 leading-relaxed">
                            {isAnonymousMode ? 'The candidate' : candidate.realName} demonstrated strong problem-solving skills, particularly in the System Design round.
                            Communication style is concise and data-driven. However, there were minor hesitations during the behavioral questions
                            regarding team conflict. Overall, the candidate matches <strong>92%</strong> of the profile requirements for the Senior Engineer role.
                        </p>
                    </div>

                    {/* Detailed Scores */}
                    <div className="grid grid-cols-3 gap-4">
                        <ScoreCard title="Technical" score={candidate.scores.technical} icon={<Code2 className="w-5 h-5" />} />
                        <ScoreCard title="Communication" score={candidate.scores.communication} icon={<MessageSquare className="w-5 h-5" />} />
                        <ScoreCard title="Culture Fit" score={candidate.scores.culture} icon={<Brain className="w-5 h-5" />} />
                    </div>

                    {/* Key Insights */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Key Observations</h3>
                        <div className="space-y-4">
                            {[
                                { type: 'strength', text: "Excellent grasp of Distributed Systems concepts." },
                                { type: 'strength', text: "Structured approach to problem decomposition." },
                                { type: 'weakness', text: "Could improve on proactively defining API contracts." },
                                { type: 'neutral', text: "Preferred Python over Java for the coding exercise." }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    {item.type === 'strength' && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                                    {item.type === 'weakness' && <XCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                                    {item.type === 'neutral' && <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center mt-0.5 text-xs text-slate-600">i</div>}
                                    <span className="text-slate-700">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Meta & Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-xs uppercase text-slate-500 mb-4 tracking-wider">Interview Details</h3>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Duration</dt>
                                <dd className="font-medium text-slate-900">45m 20s</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Questions Asked</dt>
                                <dd className="font-medium text-slate-900">5</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Code Originality</dt>
                                <dd className={`font-medium ${candidate.risks.plagiarism === 'High' ? 'text-red-600' : 'text-green-600'}`}>
                                    {candidate.risks.plagiarism === 'High' ? 'Flagged (82%)' : 'Verified (100%)'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Recommendation */}
                    <div className={`p-6 rounded-xl border-2 text-center ${candidate.status === 'Offer' || candidate.matchScore > 85 ? 'border-green-100 bg-green-50' : 'border-amber-100 bg-amber-50'
                        }`}>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Recommendation</h3>
                        <div className={`text-2xl font-black mb-1 ${candidate.status === 'Offer' || candidate.matchScore > 85 ? 'text-green-600' : 'text-amber-600'
                            }`}>
                            {candidate.status === 'Offer' || candidate.matchScore > 85 ? 'HIRE' : 'CONSIDER'}
                        </div>
                        <p className="text-sm text-slate-600">Based on aggregate score of {candidate.matchScore}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScoreCard({ title, score, icon }: { title: string, score: number, icon: React.ReactNode }) {
    // Color logic
    const color = score >= 90 ? 'text-green-600' : score >= 75 ? 'text-indigo-600' : 'text-amber-600';

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
            <div className={`mb-3 p-3 rounded-full bg-slate-50 ${color}`}>
                {icon}
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{score}/100</div>
            <div className="text-sm font-medium text-slate-500">{title}</div>
        </div>
    );
}
