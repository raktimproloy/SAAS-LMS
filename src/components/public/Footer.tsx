"use client";

import Link from "next/link";
import { Dna, MapPin, Phone, Mail } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { WhatsAppIcon } from "@/components/icons/svg";

// Inline SVG icons for platforms not in this lucide version
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
  </svg>
);


const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Student Login", href: "/student/login" },
  { label: "Admin Login", href: "/admin/login" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com/instituteweb",
    icon: FacebookIcon,
    color: "hover:text-blue-500",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@instituteweb",
    icon: YoutubeIcon,
    color: "hover:text-red-500",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/8801XXXXXXXXX",
    icon: WhatsAppIcon,
    color: "hover:text-green-500",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

export function Footer() {
  return (
    <footer className="relative bg-card border-t border-border text-card-foreground overflow-hidden">
      {/* Decorative top glow with animation */}
      <motion.div 
        animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.8, 1.2, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" 
      />
      <motion.div 
        animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[80px] bg-primary/20 blur-3xl rounded-full" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Col 1: Logo + Description */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="space-y-4"
          >
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="h-10 w-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                <Dna className="h-5 w-5 text-sky-300" />
              </div>
              <span className="font-bold text-xl text-foreground">
                Doctor<span className="text-primary">Biology</span>
              </span>
            </Link>
            <p className="text-sm text-foreground/90 leading-relaxed max-w-xs">
              মেডিকেল ভর্তি পরীক্ষা ও একাডেমিক প্রস্তুতির জন্য বাংলাদেশের সেরা অনলাইন প্ল্যাটফর্ম।
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={cn(
                      "h-9 w-9 rounded-xl bg-muted border border-border flex items-center justify-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:scale-110 text-foreground/90",
                      s.color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Col 2: Quick Links */}
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="space-y-4"
          >
            <h3 className="text-foreground font-semibold text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/90 hover:text-foreground transition-colors hover:translate-x-1 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-200 rounded-full" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 3: Contact Info */}
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="space-y-4"
          >
            <h3 className="text-foreground font-semibold text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-foreground/90">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/90">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:+8801XXXXXXXXX" className="hover:text-foreground transition-colors">
                  +880 1XXXXXXXXX
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/90">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:info@instituteweb.com" className="hover:text-foreground transition-colors">
                  info@instituteweb.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/90">
                <WhatsAppIcon className="h-4 w-4 text-green-500 shrink-0" />
                <a
                  href="https://wa.me/8801XXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-500 transition-colors"
                >
                  WhatsApp করুন
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/90">
          <p>© {new Date().getFullYear()} Institute Web LMS. All rights reserved.</p>
          <p>Made with ❤️ for Medical Students</p>
        </div>
      </div>
    </footer>
  );
}

// cn helper for this file
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
