'use client';

import { Candidate } from '@/lib/mock-data/candidates';
import { useDemoStore } from '@/lib/store/useDemoStore';
import { ShieldCheck, AlertTriangle, ArrowRight, MapPin, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CandidateCard({ candidate }: { candidate: Candidate }) {
    const { isAnonymousMode } = useDemoStore();

    // Determine display values based on mode
    const displayName = isAnonymousMode ? candidate.substituteId : candidate.realName;
    const displayImage = isAnonymousMode
        ? `https://api.dicebear.com/7.x/bottts/svg?seed=${candidate.substituteId}`
        : candidate.photoUrl;
    const displayRole = isAnonymousMode ? 'Software Engineer' : candidate.role; // Generalized role for anon
    const displayLocation = isAnonymousMode ? 'Remote / Hidden' : candidate.location;

    return (
        <div className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
            {/* Card Header / Banner */}
            <div className={`h-24 w-full ${isAnonymousMode ? 'bg-indigo-600' : 'bg-slate-800'} relative transition-colors duration-500`}>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                {isAnonymousMode && (
                    <div className="absolute top-2 right-2 bg-white/10 backdrop-blur-md px-2 py-1 rounded text-xs font-semibold text-white border border-white/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Hidden
                    </div>
                )}
            </div>

            <div className="px-5 pb-5 flex-1 flex flex-col relative">
                {/* Avatar */}
                <div className="-mt-12 mb-3">
                    <motion.div
                        layout
                        initial={false}
                        animate={{ rotateY: isAnonymousMode ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white overflow-hidden relative"
                    >
                        {/* Key to forcing re-render of image source or just handling same img tag */}
                        <motion.img
                            key={isAnonymousMode ? 'anon' : 'real'}
                            src={displayImage}
                            alt={displayName}
                            className="w-full h-full object-cover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, rotateY: isAnonymousMode ? 180 : 0 }} // Counter-rotate image so it's not mirrored? No, whole container rotates. Actually, separate images is better.
                        // Simplified approach: just swap source, let Framer animate the container flip
                        />
                    </motion.div>
                </div>

                {/* Info */}
                <div className="mb-4">
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{displayName}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {displayRole}
                    </div>
                    {!isAnonymousMode && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {displayLocation}
                        </div>
                    )}
                </div>

                {/* Match Score */}
                <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase">Match Score</div>
                    <div className={`text-xl font-bold ${candidate.matchScore >= 90 ? 'text-green-600' :
                            candidate.matchScore >= 80 ? 'text-indigo-600' : 'text-amber-600'
                        }`}>
                        {candidate.matchScore}%
                    </div>
                </div>

                {/* Risks - Only show if High/Medium and NOT in anonymous mode? Or show generic warning? */}
                {/* Requirement: "Hide candidate name, photo..." - Risks might be biased, but let's show them as data points */}
                <div className="flex gap-2 mb-6">
                    {candidate.risks.plagiarism === 'High' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                            <AlertTriangle className="w-3 h-3" />
                            Plagiarism Risk
                        </span>
                    )}
                    {candidate.status === 'Offer' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                            Offer Extended
                        </span>
                    )}
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                    <Link
                        href={`/interview/report/${candidate.id}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors group-hover:shadow-sm"
                    >
                        View Report
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
