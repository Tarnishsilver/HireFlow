'use client';

import { useDemoStore } from '@/lib/store/useDemoStore';
import { Save, Sliders, Briefcase, Clock, Zap } from 'lucide-react';
import { useState } from 'react';

export default function ConfigPage() {
    const { config, updateConfig } = useDemoStore();
    const [localConfig, setLocalConfig] = useState(config);

    const handleSave = () => {
        updateConfig(localConfig);
        // Show a toast or feedback - simulated
        alert("Configuration Saved for Next Interview Cycle");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Interview Configuration</h1>
                <p className="text-slate-500">Customize the AI interviewer persona and evaluation criteria.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-700 font-medium">
                        <Sliders className="w-5 h-5" />
                        <span>Global Settings</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">v2.4.0-stable</span>
                </div>

                <div className="p-8 space-y-8">

                    {/* Interview Style */}
                    <section className="space-y-4">
                        <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-slate-500" />
                            Company / Interview Style
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Startup', 'Enterprise', 'FAANG'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setLocalConfig({ ...localConfig, interviewType: type as any })}
                                    className={`relative p-4 rounded-lg text-left border-2 transition-all ${localConfig.interviewType === type
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="font-bold text-slate-900 mb-1">{type}</div>
                                    <div className="text-xs text-slate-500">
                                        {type === 'Startup' && 'Focus on speed, versatility, and culture fit.'}
                                        {type === 'Enterprise' && 'Focus on stability, process, and legacy systems.'}
                                        {type === 'FAANG' && 'Focus on DSA, system design, and scalability.'}
                                    </div>
                                    {localConfig.interviewType === type && (
                                        <div className="absolute top-3 right-3 w-3 h-3 bg-indigo-600 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Difficulty */}
                        <section>
                            <label className="block text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-slate-500" />
                                Technical Difficulty
                            </label>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    <span>Easy</span>
                                    <span>Medium</span>
                                    <span>Hard</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="1"
                                    value={
                                        localConfig.difficulty === 'Easy' ? 0 :
                                            localConfig.difficulty === 'Medium' ? 1 : 2
                                    }
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setLocalConfig({
                                            ...localConfig,
                                            difficulty: val === 0 ? 'Easy' : val === 1 ? 'Medium' : 'Hard'
                                        })
                                    }}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="text-center font-medium text-indigo-600 bg-indigo-50 py-1 rounded-md">
                                    {localConfig.difficulty}
                                </div>
                            </div>
                        </section>

                        {/* Duration */}
                        <section>
                            <label className="block text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-500" />
                                Target Duration (Minutes)
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={localConfig.durationMinutes}
                                    onChange={(e) => setLocalConfig({ ...localConfig, durationMinutes: parseInt(e.target.value) })}
                                    className="w-24 p-2 text-center border border-slate-300 rounded-lg font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                                <span className="text-slate-500">minutes per session</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Warning: Sessions exceeding 60 minutes may experience higher drop-off rates.
                            </p>
                        </section>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={() => setLocalConfig(config)}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
