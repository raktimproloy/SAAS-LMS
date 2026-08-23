"use client";

import { motion } from "framer-motion";

export function AboutStatsCards({ stats }: { stats: any[] }) {
  if (!stats || stats.length === 0) return null;

  return (
    <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col sm:flex-row justify-center gap-6 w-full"
        >
          {stats.slice(0, 2).map((stat: any, index: number) => (
            <div key={index} className="bg-card backdrop-blur-md border border-border rounded-2xl p-6 flex items-center gap-6 w-full sm:w-1/2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className={`w-16 h-16 rounded-2xl ${index === 0 ? 'bg-sky-500/10 border-sky-500/20' : 'bg-emerald-500/10 border-emerald-500/20'} border flex items-center justify-center shrink-0`}>
                {index === 0 ? (
                  <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                )}
              </div>
              <div>
                <h4 className="text-4xl font-black text-foreground mb-1">{stat.value}</h4>
                <p className="text-muted-foreground text-base font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
