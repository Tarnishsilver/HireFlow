'use client';

import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheatingWarning({ show }: { show: boolean }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-red-400"
                >
                    <div className="p-2 bg-white/20 rounded-full animate-pulse">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Unusual Activity Detected</h3>
                        <p className="text-sm text-red-100">
                            Large text paste detected. Originality score impacted.
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
