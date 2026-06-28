"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      className="p-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-700 dark:text-slate-200 shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
      >
        {theme === "dark" ? (
          <Sun size={22} className="text-amber-400" />
        ) : (
          <Moon size={22} className="text-indigo-600" />
        )}
      </motion.div>
    </motion.button>
  );
}
