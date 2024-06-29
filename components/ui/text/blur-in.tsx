"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurIntProps {
    word: string;
    icon?: React.ReactNode;
    className?: string;
    variant?: {
        hidden: { filter: string; opacity: number };
        visible: { filter: string; opacity: number };
    };
    duration?: number;
}
export const BlurIn = ({ word, icon, className, variant, duration = 1 }: BlurIntProps) => {
    const defaultVariants = {
        hidden: { filter: "blur(10px)", opacity: 0 },
        visible: { filter: "blur(0px)", opacity: 1 },
    };
    const combinedVariants = variant || defaultVariants;

    return (
        <motion.h1
            initial="hidden"
            animate="visible"
            transition={{ duration }}
            variants={combinedVariants}
        >
            <div className="flex">
                {icon && <span className={cn("mr-2 flex items-center")}>{icon}</span>}
                {word}
            </div>

        </motion.h1>
    );
};
