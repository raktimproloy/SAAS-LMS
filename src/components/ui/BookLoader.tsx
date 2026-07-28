"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function BookLoader() {
  const pages = [1, 2, 3, 4, 5, 6];
  // To ensure the animation restarts cleanly when mounted, though CSS handles it.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full py-20">
      
      {/* 3D Book Container */}
      <div className="book-wrapper">
        <div className="book">
          
          {/* Back Cover (Static on Right) */}
          <div className="book-cover back-cover"></div>
          
          {/* Static Right Page (Base) */}
          <div className="book-page static-right">
            <div className="page-content">
              <div className="line title"></div>
              <div className="line"></div>
              <div className="line"></div>
            </div>
          </div>

          {/* Static Left Page (Base, visible under turned pages) */}
          <div className="book-page static-left">
             <div className="page-content">
              <div className="line title"></div>
              <div className="line short"></div>
              <div className="line"></div>
            </div>
          </div>

          {/* Infinite Flipping Pages */}
          {pages.map((page, index) => (
            <div 
              key={page} 
              className="book-page flipping-page" 
              style={{ animationDelay: `${index * 0.4}s` }}
            >
              <div className="page-content">
                <div className="line title"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line short"></div>
              </div>
            </div>
          ))}

          {/* Front Cover (Opens Once) */}
          <div className="book-cover front-cover"></div>
        </div>
      </div>

      {/* Loading Text */}
      <div className="mt-24 flex flex-col items-center opacity-90">
        <span className="text-primary/80 font-bold text-sm tracking-[0.3em] uppercase mb-2">
          Doctor Biology
        </span>
        <div className="flex items-center space-x-1">
          <span className="text-muted-foreground font-medium text-xs tracking-widest uppercase">
            Loading Knowledge
          </span>
          <div className="flex space-x-1 ml-2">
            <motion.div className="w-1 h-1 bg-primary/60 rounded-full" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
            <motion.div className="w-1 h-1 bg-primary/60 rounded-full" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
            <motion.div className="w-1 h-1 bg-primary/60 rounded-full" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .book-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1200px;
          position: relative;
        }

        .book-wrapper::after {
          content: '';
          position: absolute;
          bottom: -40px;
          width: 140px;
          height: 10px;
          background: rgba(14, 165, 233, 0.2);
          border-radius: 50%;
          filter: blur(10px);
          animation: shadow-pulse 3s ease-in-out infinite;
        }

        .book {
          width: 180px;
          height: 120px;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateX(25deg) rotateY(-15deg) rotateZ(2deg);
          animation: float 3s ease-in-out infinite;
        }

        .book-cover {
          position: absolute;
          width: 100px;
          height: 130px;
          background: linear-gradient(145deg, #0284c7, #0369a1);
          border-radius: 4px 12px 12px 4px;
          top: -5px;
          box-shadow: inset 4px 0 10px rgba(0,0,0,0.1), inset -1px 0 2px rgba(255,255,255,0.3);
          transform-origin: left center;
          transform-style: preserve-3d;
        }

        .book-cover.back-cover {
          left: 90px;
          transform: translateZ(-5px);
          box-shadow: 5px 15px 25px rgba(0,0,0,0.15);
        }

        .book-cover.front-cover {
          left: 90px;
          transform: translateZ(5px);
          /* Opens ONCE and stays open */
          animation: openCover 1.5s ease-out forwards;
          z-index: 100;
        }

        .book-page {
          position: absolute;
          width: 92px;
          height: 120px;
          background: #fcfcfc;
          border-radius: 2px 8px 8px 2px;
          top: 0;
          left: 90px;
          transform-origin: left center;
          transform-style: preserve-3d;
          box-shadow: inset 3px 0 10px rgba(0,0,0,0.03), 1px 1px 3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          padding: 15px 10px;
          gap: 6px;
        }

        .static-right {
          transform: translateZ(0px) rotateY(0deg);
          z-index: 1;
        }

        .static-left {
          transform: translateZ(0px) rotateY(-175deg);
          z-index: 1;
        }

        .flipping-page {
          /* 2.4s total animation: 6 pages * 0.4s delay staggered perfectly */
          animation: infiniteFlip 2.4s linear infinite;
          /* Ensure pages start hidden until cover is open */
          opacity: 0; 
        }

        @keyframes openCover {
          0% { transform: translateZ(5px) rotateY(0deg); }
          100% { transform: translateZ(5px) rotateY(-175deg); }
        }

        /* 
          Infinite Flip Animation (2.4s cycle):
          0% - 15%: wait for initial cover delay 
          15% - 45%: rotate from 0 to -175deg
          45% - 46%: hide (opacity 0)
          46% - 99%: stay hidden and snap back to 0deg
          100%: show (opacity 1) ready for next loop
        */
        @keyframes infiniteFlip {
          0% { 
            transform: translateZ(2px) rotateY(0deg); 
            opacity: 1; 
            z-index: 10;
          }
          40% { 
            transform: translateZ(2px) rotateY(-170deg); 
            opacity: 1; 
            z-index: 10;
          }
          45% {
             transform: translateZ(2px) rotateY(-175deg); 
             opacity: 0; 
             z-index: 0;
          }
          46% { 
            transform: translateZ(2px) rotateY(0deg); 
            opacity: 0; 
          }
          100% { 
            transform: translateZ(2px) rotateY(0deg); 
            opacity: 1; 
            z-index: 10;
          }
        }


        .page-content .line {
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          width: 100%;
        }
        .page-content .line.title {
          height: 6px;
          width: 70%;
          background: #cbd5e1;
          margin-bottom: 8px;
        }
        .page-content .line.short {
          width: 50%;
        }

        @keyframes float {
          0%, 100% { transform: rotateX(25deg) rotateY(-15deg) rotateZ(2deg) translateY(0); }
          50% { transform: rotateX(25deg) rotateY(-15deg) rotateZ(2deg) translateY(-10px); }
        }

        @keyframes shadow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(0.8); opacity: 0.1; }
        }
        `
      }} />
    </div>
  );
}
