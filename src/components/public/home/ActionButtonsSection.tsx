"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Download, LogIn } from "lucide-react";

export function ActionButtonsSection() {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link 
            href="/student/login"
            className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-base shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:shadow-[0_0_60px_-10px_hsl(var(--primary))] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <LogIn className="w-5 h-5 relative z-10" />
            <span className="relative z-10 text-white">Student Login</span>
          </Link>

          <button 
            className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-6 py-4 bg-card border-2 border-primary/20 text-foreground rounded-lg font-bold text-base shadow-xl hover:border-primary transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 text-primary">
              <Download className="w-4 h-4" />
            </div>
            <span>Install App</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
