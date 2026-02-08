'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_QUESTIONS } from '@/lib/mock-data/questions';
import { useInterviewStore } from '@/lib/store/useInterviewStore';
import CheatingWarning from '@/components/interview/CheatingWarning';
import { Mic, Video, Monitor, MoreVertical, SkipForward, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InterviewRoom() {
    const router = useRouter();
    const { id } = useParams(); // Interview ID
    const {
        currentQuestionIndex,
        nextQuestion,
        status,
        startInterview,
        endInterview,
        setPlagiarismRisk,
        plagiarismRisk
    } = useInterviewStore();

    const [timeLeft, setTimeLeft] = useState(MOCK_QUESTIONS[0].durationSeconds);
    const [answer, setAnswer] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    // Safe question lookup
    const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex] || MOCK_QUESTIONS[0];
    const isLastQuestion = currentQuestionIndex >= MOCK_QUESTIONS.length - 1;

    // Initialize
    useEffect(() => {
        startInterview();
    }, []);

    // Timer
    useEffect(() => {
        if (status !== 'IN_PROGRESS') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Auto advance or stop? For demo, just stop taking input
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status, currentQuestionIndex]);

    // Reset timer on question change
    useEffect(() => {
        setTimeLeft(currentQuestion.durationSeconds);
        setAnswer('');
        setIsRecording(true);
    }, [currentQuestionIndex]);

    // Cheating Detector
    const handlePaste = (e: React.ClipboardEvent) => {
        const text = e.clipboardData.getData('text');
        if (text.length > 50) {
            setPlagiarismRisk('HIGH');
            // Hide warning after 3 seconds
            setTimeout(() => setPlagiarismRisk('NONE'), 4000);
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            endInterview();
            router.push(`/interview/report/${id}`); // Go to report (simulated result)
        } else {
            nextQuestion();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6 p-4">
            {/* Left: AI Interviewer */}
            <div className="w-1/2 flex flex-col gap-4">
                <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800">
                    {/* Simulated Video Feed */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center">
                        {/* Using a tech-y abstract avatar video or image */}
                        <div className="w-40 h-40 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
                            <div className="w-32 h-32 rounded-full bg-indigo-500/40 flex items-center justify-center">
                                <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]"></div>
                            </div>
                        </div>
                        <p className="absolute bottom-10 text-indigo-200 font-mono text-sm tracking-widest uppercase">
                            {isRecording ? 'Listening...' : 'AI Processing...'}
                        </p>
                    </div>

                    {/* Overlays */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <div className="px-3 py-1 bg-black/40 backdrop-blur rounded-full text-xs font-medium text-white flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            REC
                        </div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="h-48 bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
                    <span className="text-xs font-bold text-indigo-600 uppercase mb-2">Question {currentQuestionIndex + 1} of {MOCK_QUESTIONS.length}</span>
                    <h2 className="text-xl font-bold text-slate-900 leading-snug">
                        {currentQuestion.text}
                    </h2>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                        <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">{currentQuestion.category}</span>
                        <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">{currentQuestion.difficulty}</span>
                    </div>
                </div>
            </div>

            {/* Right: Candidate Workspace */}
            <div className="w-1/2 flex flex-col gap-4 relative">
                <CheatingWarning show={plagiarismRisk === 'HIGH'} />

                {/* Toolbar */}
                <div className="h-16 bg-white rounded-xl border border-slate-200 shadow-sm px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-slate-400">
                        <Mic className="w-5 h-5 text-slate-900" />
                        <Video className="w-5 h-5 text-slate-900" />
                        <Monitor className="w-5 h-5" />
                    </div>
                    <div className={`text-2xl font-mono font-bold ${timeLeft < 30 ? 'text-red-600' : 'text-slate-700'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Answer Area */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onPaste={handlePaste}
                        placeholder="Type your answer here or speak..."
                        className="flex-1 p-6 resize-none focus:outline-none text-lg text-slate-700 font-sans leading-relaxed"
                    />
                    <div className="h-20 border-t border-slate-100 bg-slate-50 px-6 flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            {answer.length} characters
                        </p>
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                        >
                            {isLastQuestion ? 'Finish Interview' : 'Next Question'}
                            {isLastQuestion ? <CheckCircle className="w-5 h-5" /> : <SkipForward className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
