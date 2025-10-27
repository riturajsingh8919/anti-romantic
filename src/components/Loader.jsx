"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

function Loader({ onLoadComplete }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [fillHeight, setFillHeight] = useState(100);

  useEffect(() => {
    const fillInterval = setInterval(() => {
      setFillHeight((prev) => {
        if (prev <= 0) {
          clearInterval(fillInterval);
          return 0;
        }
        return prev - 1.25; // Slower than original (2) but completes in 2 seconds
      });
    }, 25); // Balanced timing for smooth but slower fill

    const timer = setTimeout(() => {
      setIsLoaded(true);
      if (onLoadComplete) {
        setTimeout(onLoadComplete, 300);
      }
    }, 2000); // Back to original 2 seconds

    return () => {
      clearInterval(fillInterval);
      clearTimeout(timer);
    };
  }, [onLoadComplete]);

  return (
    <motion.div
      className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: isLoaded ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      style={{ pointerEvents: isLoaded ? "none" : "auto" }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/loader-bg.svg"
          alt="Loader Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Text */}
      <div className="relative">
        <svg
          width="900"
          height="250"
          viewBox="0 0 900 250"
          className="w-[95vw] max-w-[900px] h-auto"
        >
          <defs>
            <clipPath id="bubbleFill">
              <rect x="0" y={`${fillHeight}%`} width="100%" height="100%" />
            </clipPath>
          </defs>

          {/* White text - always visible */}
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            style={{
              fontFamily: "var(--font-luminaire)",
              fontSize: "120px",
              fill: "#FBF7EE",
              fontWeight: "normal",
            }}
          >
            antiromantic
          </text>

          {/* Blue text with bubble fill from bottom */}
          <g clipPath="url(#bubbleFill)">
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              style={{
                fontFamily: "var(--font-luminaire)",
                fontSize: "120px",
                fill: "#91B3C7",
                fontWeight: "normal",
              }}
            >
              antiromantic
            </text>
          </g>
        </svg>
      </div>
    </motion.div>
  );
}

export default Loader;
