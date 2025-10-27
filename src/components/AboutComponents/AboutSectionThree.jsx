"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

function AboutSectionThree() {
  // Left side text container - stagger
  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  // Icon - scale with lift
  const iconVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 30,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // Heading - bottom entry with blur
  const headingVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Paragraph - left entry with blur
  const paragraphVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      filter: "blur(5px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Image - right entry with scale and blur
  const imageVariants = {
    hidden: {
      opacity: 0,
      x: 40,
      scale: 0.95,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3,
      },
    },
  };

  return (
    <section className="relative bg-[url('/about/about-sec-2-bg.jpg')] bg-no-repeat bg-cover overflow-x-hidden -mt-1">
      <div className="relative flex flex-col-reverse md:flex-row">
        {/* Left side - Text content with stagger */}
        <motion.div
          className="w-full md:w-[45%] flex items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={textContainerVariants}
        >
          <div className="flex flex-col gap-8 px-4 md:px-0 md:max-w-[80%] mx-auto py-16">
            {/* Icon - scale animation */}
            <motion.div variants={iconVariants}>
              <Image
                src="/about/home-sec-3-icon.svg"
                alt="About Section Image"
                width={80}
                height={104}
                className="w-fit h-[80px] object-cover"
              />
            </motion.div>

            {/* Heading - bottom entry with blur */}
            <motion.h2
              className="text-text text-3xl lg:text-4xl relative"
              variants={headingVariants}
            >
              positioning
            </motion.h2>

            {/* Paragraphs - left entry with blur (staggered) */}
            <motion.div className="flex flex-col gap-3">
              <motion.p variants={paragraphVariants}>
                Love isn't something you chase, it's something you choose. And
                that choice should always include your wardrobe.
              </motion.p>
              <motion.p variants={paragraphVariants}>
                Thoughtfully crafted in small batches, using natural fabrics and
                responsible practices — we take the silhouettes you know and
                rework them with details that make them unmistakably yours.
                These are the pieces that bring you comfort, ones you keep
                coming back to, ones that feel like home. Antiromantic is made
                to be worn, loved, and lived in—not just for a season, but for
                years to come. Because the things you love should love you back.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Image with right entry */}
        <motion.div
          className="w-full md:w-[55%] flex items-center justify-baseline md:justify-end pl-16 md:pl-0 py-16 pr-16 bg-[url('/about/section-3-right-bg.png')] bg-no-repeat bg-cover"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={imageVariants}
        >
          <Image
            src="/about/section-3-img.png"
            alt="About Section Image"
            width={500}
            height={300}
            className="w-full md:w-fit md:h-[38vh] lg:h-[60vh] object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}

export default AboutSectionThree;
