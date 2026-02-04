"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Activity, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Input types
type BurnoutFormData = {
    Age: number;
    DistanceFromHome: number;
    JobLevel: number; // 1-5
    MonthlyIncome: number;
    NumCompaniesWorked: number;
    TotalWorkingYears: number;
    YearsAtCompany: number;
    YearsInCurrentRole: number;
    YearsSinceLastPromotion: number;
    YearsWithCurrManager: number;
    Department: string;
    JobRole: string;
    Gender: string;
    MaritalStatus: string;
    OverTime: string; // "Yes" or "No"
};

const INITIAL_DATA: BurnoutFormData = {
    Age: 30,
    DistanceFromHome: 5,
    JobLevel: 1,
    MonthlyIncome: 5000,
    NumCompaniesWorked: 1,
    TotalWorkingYears: 5,
    YearsAtCompany: 2,
    YearsInCurrentRole: 2,
    YearsSinceLastPromotion: 1,
    YearsWithCurrManager: 2,
    Department: "Research & Development",
    JobRole: "Research Scientist",
    Gender: "Male",
    MaritalStatus: "Single",
    OverTime: "No",
};

export default function BurnoutDetectorPage() {
    const [formData, setFormData] = useState<BurnoutFormData>(INITIAL_DATA);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch("/api/burnout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get prediction");
            }

            // Assuming API returns just a string or object with 'prediction'
            // Adjust based on actual API response format
            setResult(typeof data === 'string' ? data : JSON.stringify(data));

        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 mb-4 shadow-2xl shadow-purple-500/10">
                        <Activity className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/60 tracking-tight">
                        Wellness Check
                    </h1>
                    <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
                        Our AI-powered tool analyzes work patterns to help you understand your current professional well-being and potential burnout risk.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                            <form onSubmit={handleSubmit} className="space-y-8">

                                {/* Personal Info Group */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-medium text-white/80 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-purple-500 rounded-full" />
                                        Personal Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputGroup label="Age" name="Age" type="number" value={formData.Age} onChange={handleInputChange} min={18} max={70} />
                                        <SelectGroup label="Gender" name="Gender" value={formData.Gender} onChange={handleInputChange} options={["Male", "Female"]} />
                                        <SelectGroup label="Marital Status" name="MaritalStatus" value={formData.MaritalStatus} onChange={handleInputChange} options={["Single", "Married", "Divorced"]} />
                                        <InputGroup label="Distance From Home (km)" name="DistanceFromHome" type="number" value={formData.DistanceFromHome} onChange={handleInputChange} min={0} />
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                {/* Job Info Group */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-medium text-white/80 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-blue-500 rounded-full" />
                                        Job Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectGroup label="Department" name="Department" value={formData.Department} onChange={handleInputChange} options={["Research & Development", "Sales", "Human Resources"]} />
                                        <SelectGroup label="Job Role" name="JobRole" value={formData.JobRole} onChange={handleInputChange} options={[
                                            "Sales Executive", "Research Scientist", "Laboratory Technician", "Manufacturing Director", "Healthcare Representative", "Manager", "Sales Representative", "Research Director", "Human Resources"
                                        ]} />
                                        <InputGroup label="Job Level (1-5)" name="JobLevel" type="number" value={formData.JobLevel} onChange={handleInputChange} min={1} max={5} />
                                        <InputGroup label="Monthly Income" name="MonthlyIncome" type="number" value={formData.MonthlyIncome} onChange={handleInputChange} min={1000} />
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                {/* Experience Group */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-medium text-white/80 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                                        History & Tenure
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <InputGroup label="Num Companies" name="NumCompaniesWorked" type="number" value={formData.NumCompaniesWorked} onChange={handleInputChange} min={0} />
                                        <InputGroup label="Total Working Years" name="TotalWorkingYears" type="number" value={formData.TotalWorkingYears} onChange={handleInputChange} min={0} />
                                        <InputGroup label="Years At Company" name="YearsAtCompany" type="number" value={formData.YearsAtCompany} onChange={handleInputChange} min={0} />
                                        <InputGroup label="Years In Role" name="YearsInCurrentRole" type="number" value={formData.YearsInCurrentRole} onChange={handleInputChange} min={0} />
                                        <InputGroup label="Years Since Level Up" name="YearsSinceLastPromotion" type="number" value={formData.YearsSinceLastPromotion} onChange={handleInputChange} min={0} />
                                        <InputGroup label="Years With Manager" name="YearsWithCurrManager" type="number" value={formData.YearsWithCurrManager} onChange={handleInputChange} min={0} />
                                    </div>
                                    <div className="pt-2">
                                        <label className="block text-sm font-medium text-white/40 mb-2">OverTime?</label>
                                        <div className="flex gap-4">
                                            {["Yes", "No"].map((opt) => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, OverTime: opt }))}
                                                    className={cn(
                                                        "flex-1 py-3 px-4 rounded-xl border transition-all text-sm font-medium",
                                                        formData.OverTime === opt
                                                            ? "bg-white text-black border-white"
                                                            : "bg-transparent text-white/60 border-white/10 hover:border-white/30"
                                                    )}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-8"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Analyzing Pattern...
                                        </>
                                    ) : (
                                        <>
                                            Analyze Well-being Risk
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Result Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="lg:col-span-1"
                    >
                        <div className="sticky top-12 space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                <h3 className="text-xl font-semibold mb-4 text-white/90">Analysis Result</h3>

                                <AnimatePresence mode="wait">
                                    {result ? (
                                        <motion.div
                                            key="result"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={cn(
                                                "rounded-2xl p-6 border",
                                                // Make simple assumption on 'result' string for styling, user can refine
                                                result.toLowerCase().includes("yes") || result.toLowerCase().includes("high")
                                                    ? "bg-red-500/10 border-red-500/30"
                                                    : "bg-green-500/10 border-green-500/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                {result.toLowerCase().includes("yes") || result.toLowerCase().includes("high") ? (
                                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                                ) : (
                                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                                )}
                                                <span className={cn(
                                                    "text-lg font-bold",
                                                    result.toLowerCase().includes("yes") || result.toLowerCase().includes("high") ? "text-red-300" : "text-green-300"
                                                )}>
                                                    {result.toLowerCase().includes("yes") ? "High Risk Detected" : "Low Risk Detected"}
                                                </span>
                                            </div>
                                            <p className="text-white/70 text-sm leading-relaxed">
                                                Prediction output: <span className="text-white font-mono">{result}</span>
                                            </p>
                                            <p className="text-white/40 text-xs mt-4">
                                                *This is an AI estimation and should not replace professional medical or psychological advice.
                                            </p>
                                        </motion.div>
                                    ) : error ? (
                                        <motion.div
                                            key="error"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-200"
                                        >
                                            <div className="flex items-center gap-2 mb-2 font-semibold">
                                                <AlertTriangle className="w-5 h-5" />
                                                Error
                                            </div>
                                            {error}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-12 text-white/20"
                                        >
                                            <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>Fill out the form to generate a Burnout Risk analysis.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Tips Card */}
                            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                                <h4 className="font-medium text-white/80 mb-3">Did you know?</h4>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    Regular breaks and separating work from personal time can reduce burnout risk by up to 40%. Keep track of your work-life balance!
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}

// Helper Components
function InputGroup({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-white/40 mb-2">{label}</label>
            <input
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all hover:bg-black/30 placeholder:text-white/10"
                {...props}
            />
        </div>
    );
}

function SelectGroup({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, options: string[] }) {
    return (
        <div>
            <label className="block text-sm font-medium text-white/40 mb-2">{label}</label>
            <div className="relative">
                <select
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all hover:bg-black/30 appearance-none cursor-pointer"
                    {...props}
                >
                    {options.map(opt => (
                        <option key={opt} value={opt} className="bg-gray-900">{opt}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    );
}
