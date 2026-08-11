"use client";

import { FlaskConical, Microscope, Dna, GraduationCap, Zap, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    id: 1,
    icon: FlaskConical,
    title: "লাইভ ও অফলাইন ক্লাস",
    desc: "প্রতিদিন বিশেষজ্ঞ শিক্ষকদের সাথে রিয়েল-টাইম ইন্টারেক্টিভ ক্লাস করুন।",
    color: "from-purple-500/20 to-purple-500/0",
    iconColor: "text-purple-400",
    borderColor: "group-hover:border-purple-500/50"
  },
  {
    id: 2,
    icon: Microscope,
    title: "অ্যাডভান্সড ল্যাব প্র্যাকটিক্যাল",
    desc: "বায়োলজির প্রতিটি থিওরি হাতে-কলমে শিখুন আমাদের আধুনিক ল্যাবে।",
    color: "from-emerald-500/20 to-emerald-500/0",
    iconColor: "text-emerald-400",
    borderColor: "group-hover:border-emerald-500/50"
  },
  {
    id: 3,
    icon: Dna,
    title: "প্রিমিয়াম স্টাডি মেটেরিয়াল",
    desc: "স্মার্ট নোট, ভিডিও লেকচার ও এক্সক্লুসিভ প্র্যাকটিস শিট এক জায়গায়।",
    color: "from-blue-500/20 to-blue-500/0",
    iconColor: "text-blue-400",
    borderColor: "group-hover:border-blue-500/50"
  },
  {
    id: 4,
    icon: GraduationCap,
    title: "মেগা এক্সাম ও মডেল টেস্ট",
    desc: "মেডিকেল ভর্তি পরীক্ষার স্টাইলে মানসম্মত প্রশ্নে রেগুলার পরীক্ষা।",
    color: "from-rose-500/20 to-rose-500/0",
    iconColor: "text-rose-400",
    borderColor: "group-hover:border-rose-500/50"
  },
  {
    id: 5,
    icon: Zap,
    title: "ইনস্ট্যান্ট সলভ ক্লাস",
    desc: "যেকোনো কঠিন টপিক বা কনফিউশনে এক্সপার্ট টিচারদের তাৎক্ষণিক সাপোর্ট।",
    color: "from-amber-500/20 to-amber-500/0",
    iconColor: "text-amber-400",
    borderColor: "group-hover:border-amber-500/50"
  },
  {
    id: 6,
    icon: Shield,
    title: "সেরা গাইডলাইন ও মেন্টরিং",
    desc: "আপনার সফলতার জন্য সার্বক্ষণিক পারসোনাল মেন্টরশিপ ও মনিটরিং।",
    color: "from-cyan-500/20 to-cyan-500/0",
    iconColor: "text-cyan-400",
    borderColor: "group-hover:border-cyan-500/50"
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">

      {/* Decorative Gradients */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
            সেরা শিক্ষার <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">অভিজ্ঞতা</span>
          </h2>
          <p className="text-foreground max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
            আমাদের প্ল্যাটফর্মে পাবেন সবকিছু যা একজন সফল মেডিকেল শিক্ষার্থীর প্রয়োজন।
            সেরা শিক্ষক, আধুনিক প্রযুক্তি এবং সঠিক গাইডলাইনের এক অনন্য সমন্বয়।
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative rounded-xl bg-card border border-border p-8 sm:p-10 overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-sm hover:shadow-md ${feature.borderColor}`}
              >
                {/* Background Hover Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl backdrop-blur-sm">
                    <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-4 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-foreground leading-relaxed text-base">
                    {feature.desc}
                  </p>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-muted rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
