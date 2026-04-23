import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ProfileCompletionBar({ percentage }) {
    const [color, setColor] = useState("#EF4444"); // Red for low

    useEffect(() => {
        if (percentage < 40) setColor("#EF4444"); // Red
        else if (percentage < 75) setColor("#F59E0B"); // Orange
        else if (percentage < 100) setColor("#10B981"); // Green
        else setColor("#3B82F6"); // Blue for 100%
    }, [percentage]);

    return (
        <div className="w-full mb-8">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium opacity-80">Profile Completion</span>
                <span className="text-sm font-bold" style={{ color }}>{percentage}%</span>
            </div>
            <div className="w-full bg-primary h-2 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
        </div>
    );
}
