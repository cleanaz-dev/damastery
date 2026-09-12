"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const images = [
  "/images/hero-1.webp",
  "/images/hero-2.webp",
  "/images/hero-3.webp",
];

export function HeroImage() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative hidden h-[520px] w-full max-w-[620px] lg:block">
      {/* Elegant vertical edge */}
      <div className="absolute left-0 top-8 z-30 h-[calc(100%-64px)] w-px bg-accent/70" />

      {/* 
        CSS Mask Container:
        This smoothly crops and fades EVERYTHING inside it to completely transparent on the right side.
        It blends directly into your page background, permanently eliminating right-edge glitches.
      */}
      <div 
        className="absolute inset-y-0 left-8 right-0 z-10 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, black 40%, transparent 95%)",
          WebkitMaskImage: "linear-gradient(to right, black 40%, transparent 95%)"
        }}
      >
        <AnimatePresence>
          <motion.div
            key={activeIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.5, ease: "easeInOut" },
              // Slow, continuous zoom for a high-end feel
              scale: { duration: 6, ease: "linear" } 
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${images[activeIndex]}')` }}
            />
            
            {/* Subtle overlay tint */}
            <div className="absolute inset-0 bg-primary/10" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Editorial caption */}
      <div className="absolute bottom-8 left-6 z-30 flex items-center gap-3">
        <span className="h-px w-6 bg-accent" />
        <span className="text-[9px] uppercase tracking-[0.3em] text-primary-foreground/50">
          A space to return
        </span>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-8 right-4 z-30 flex gap-2">
        {images.map((_, index) => (
          <span
            key={index}
            className={`h-px transition-all duration-700 ${
              index === activeIndex
                ? "w-8 bg-accent"
                : "w-3 bg-primary-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}