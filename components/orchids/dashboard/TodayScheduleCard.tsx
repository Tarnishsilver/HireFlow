import { useEffect, useState } from "react";
import { ChevronDown, Plus, CheckCircle2, Circle, Loader2 } from "lucide-react";

interface Event {
    id: string;
    title: string;
    start: string;
    end: string;
    location?: string;
    description?: string;
}

interface Task {
    id: string;
    title: string;
    is_completed: boolean;
}

interface TodayScheduleCardProps {
    events?: Event[];
    onAddEvent?: () => void;
}

export function TodayScheduleCard({ events = [], onAddEvent }: TodayScheduleCardProps) {
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks');
            if (res.ok) {
                const data = await res.json();
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) {
            setIsAddingTask(false);
            return;
        }

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTaskTitle })
            });

            if (res.ok) {
                const data = await res.json();
                setTasks(prev => [data.task, ...prev]);
                setNewTaskTitle("");
            }
        } catch (error) {
            console.error("Failed to add task", error);
        } finally {
            setIsAddingTask(false);
        }
    };

    const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    };

    const displayEvents = events.slice(0, 3);

    return (
        <div className="bg-white dark:bg-[#242424] rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white/90">Today Schedule</h3>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-white/50 border border-gray-200 dark:border-white/[0.08] rounded-xl px-2.5 py-1.5">
                        {todayStr}
                        <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
                    </div>
                    <button
                        onClick={() => setIsAddingTask(true)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl px-3 py-1.5 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" strokeWidth={1.5} />
                        Add Task
                    </button>
                </div>
            </div>

            {/* Input for New Task */}
            {isAddingTask && (
                <div className="mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                            placeholder="Type task and press Enter..."
                            autoFocus
                            className="flex-1 text-sm border border-gray-200 dark:border-white/[0.08] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-white/[0.04] text-gray-900 dark:text-white/90"
                        />
                        <button
                            onClick={handleAddTask}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-700"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            {/* Combined List: Events then Tasks */}
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar flex-1">

                {/* Events Section */}
                {displayEvents.length > 0 && (
                    <div className="space-y-2 mb-4">
                        <p className="text-[11px] font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wider">Meetings</p>
                        {displayEvents.map((event, index) => {
                            const startDate = new Date(event.start);
                            const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const colors = [
                                "bg-green-100 dark:bg-green-500/10 border-green-500 text-green-800 dark:text-green-400",
                                "bg-blue-100 dark:bg-blue-500/10 border-blue-500 text-blue-800 dark:text-blue-400"
                            ];
                            const colorClass = colors[index % colors.length];

                            return (
                                <div key={`evt-${index}`} className="flex items-center gap-3 group">
                                    <span className="text-[11px] text-gray-400 dark:text-white/40 w-[55px] shrink-0 text-right">{timeStr}</span>
                                    <div className={`flex-1 h-9 rounded-xl border-l-[3px] flex items-center px-3 hover:scale-[1.01] transition-all cursor-pointer ${colorClass}`}>
                                        <span className="text-[11px] font-medium truncate">{event.title}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Tasks Section */}
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wider flex justify-between items-center">
                        Tasks
                        {loadingTasks && <Loader2 className="w-3 h-3 animate-spin" />}
                    </p>
                    {tasks.length === 0 && !loadingTasks && (
                        <p className="text-xs text-gray-400 dark:text-white/30 italic py-2 text-center">No current tasks.</p>
                    )}
                    {tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3 group hover:bg-gray-50 dark:hover:bg-white/[0.04] p-1.5 rounded-xl transition-colors">
                            <button
                                onClick={() => toggleTaskCompletion(task.id, task.is_completed)}
                                className="shrink-0 text-gray-300 dark:text-white/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                {task.is_completed ?
                                    <CheckCircle2 className="w-5 h-5 text-green-500" strokeWidth={1.5} /> :
                                    <Circle className="w-5 h-5" strokeWidth={1.5} />
                                }
                            </button>
                            <span className={`text-sm flex-1 truncate ${task.is_completed ? 'line-through text-gray-400 dark:text-white/30' : 'text-gray-700 dark:text-white/70'}`}>
                                {task.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
