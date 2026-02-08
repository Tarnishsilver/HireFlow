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
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm h-full flex flex-col items-center justify-center text-center">
                <Briefcase className="w-10 h-10 text-gray-300 dark:text-muted mb-2" />
                <p className="text-sm text-gray-500 dark:text-muted-foreground">No active job posting selected.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm h-full flex flex-col">
            <p className="text-[11px] text-gray-400 mb-1">Posted on: <span className="font-medium text-gray-500 dark:text-muted-foreground">{new Date(job.created_at).toLocaleDateString()}</span></p>
            <h3 className="font-bold text-[17px] text-gray-900 dark:text-foreground mb-2 truncate">{job.title}</h3>
            <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed mb-3 flex-1">
                {job._count?.applications || 0} applications received so far.
            </p>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-[11px] bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground rounded-full px-3 py-1 font-medium">{job.job_type}</span>
                <span className="text-[11px] bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground rounded-full px-3 py-1 font-medium">Active</span>
            </div>
            <div className="border-t border-gray-100 dark:border-border pt-4 mt-auto">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-300">
                        HR
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-foreground">Hiring Manager</p>
                        <p className="text-xs text-gray-400">hr@company.com</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                    {/* Mock data for now as we don't have phone/hours in job model yet */}
                    <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        (+62) 812 3456 7890
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Recently active
                    </div>
                </div>
            </div>
        </div>
    );
}
