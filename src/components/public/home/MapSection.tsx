"use client";

import { MapPin, Navigation } from "lucide-react";

export function MapSection() {
  // Replace this with the actual coordinates or name of the coaching center
  const destination = "Farmgate, Dhaka, Bangladesh";
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-background relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              আমাদের অবস্থান
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">সরাসরি অফিসে এসে যোগাযোগ করতে পারেন অথবা ম্যাপ দেখে চলে আসুন</p>
          </div>
          
          <a 
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
          >
            <Navigation className="w-5 h-5" />
            গুগল ম্যাপে ডিরেকশন পান
          </a>
        </div>

        {/* Large Google Map */}
        <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl relative group">
          
          {/* Overlay to avoid accidental scrolls - optional, we'll keep pointer-events auto for interactivity */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14606.06792955431!2d90.38426149999999!3d23.755673450000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8a6a68a5c69%3A0x28972551a37c050!2sFarmgate%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="grayscale group-hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </div>
    </section>
  );
}
