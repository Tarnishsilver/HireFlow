import { Phone, Clock, Briefcase } from "lucide-react";

interface Job {
    id: string;
    title: string;
    job_type: string;
    created_at: string;
    _count?: {
        applications: number;
    };
}

interface JobCardProps {
    job?: Job;
}

export function JobCard({ job }: JobCardProps) {
    if (!job) {
        return (
            <div className="bg-white dark:bg-[#242424] rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5 h-full flex flex-col items-center justify-center text-center">
                <Briefcase className="w-10 h-10 text-gray-300 dark:text-white/20 mb-2" strokeWidth={1.5} />
                <p className="text-sm text-gray-500 dark:text-white/40">No active job posting selected.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#242424] rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5 h-full flex flex-col">
            <p className="text-[11px] text-gray-400 dark:text-white/40 mb-1">Posted on: <span className="font-medium text-gray-500 dark:text-white/50">{new Date(job.created_at).toLocaleDateString()}</span></p>
            <h3 className="font-bold text-[17px] text-gray-900 dark:text-white/90 mb-2 truncate">{job.title}</h3>
            <p className="text-xs text-gray-500 dark:text-white/50 leading-relaxed mb-3 flex-1">
                {job._count?.applications || 0} applications received so far.
            </p>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-[11px] bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-white/60 rounded-full px-3 py-1 font-medium">{job.job_type}</span>
                <span className="text-[11px] bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full px-3 py-1 font-medium">Active</span>
            </div>
            <div className="border-t border-gray-100 dark:border-white/[0.06] pt-4 mt-auto">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-500/15 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-400">
                        HR
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white/90">Hiring Manager</p>
                        <p className="text-xs text-gray-400 dark:text-white/40">hr@company.com</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-white/40 mt-2">
                    <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" strokeWidth={1.5} />
                        (+62) 812 3456 7890
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" strokeWidth={1.5} />
                        Recently active
                    </div>
                </div>
            </div>
        </div>
    );
}
