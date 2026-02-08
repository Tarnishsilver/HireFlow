
import { MoreHorizontal, Loader2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { useEffect, useState } from "react";

export function WorkHoursCard() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWorkLogs() {
            try {
                const res = await fetch('/api/work-logs');
                if (res.ok) {
                    const result = await res.json();
                    if (result.workLogs && result.workLogs.length > 0) {
                        setData(result.workLogs);
                    } else {
                        // Fallback data
                        setData([
                            { name: "Mon", hours: 6 },
                            { name: "Tue", hours: 8 },
                            { name: "Wed", hours: 7 },
                            { name: "Thu", hours: 10 },
                            { name: "Fri", hours: 9 },
                            { name: "Sat", hours: 4 },
                            { name: "Sun", hours: 0 },
                        ]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch work logs", error);
            } finally {
                setLoading(false);
            }
        }
        fetchWorkLogs();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm min-h-[300px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[15px] text-gray-900 dark:text-foreground">Member Work Hours</h3>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={32}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#F3F4F6'
                            }}
                        />
                        <Bar
                            dataKey="hours"
                            fill="#6366f1"
                            radius={[6, 6, 6, 6]}
                            background={{ fill: '#F3F4F6', radius: [6, 6, 6, 6] }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
