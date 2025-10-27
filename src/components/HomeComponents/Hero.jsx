"use client";

import Image from "next/image";
import React from "react";

function Hero() {
  return (
    <section className="relative w-full lg:h-screen">
      <div className="flex relative">
        <video
          src="/hero.mov"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-[80vh] lg:h-screen object-cover"
          style={{
            WebkitPlaysinline: true,
          }}
        >
          {/* Fallback for browsers that don't support the video */}
          <Image
            src="/hero-right.png"
            alt="Hero Image"
            width={700}
            height={475}
            className="w-full h-[80vh] lg:h-screen object-cover"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
      </div>
    </section>
  );
}

export default Hero;
