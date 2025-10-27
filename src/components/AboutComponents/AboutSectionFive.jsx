"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

function AboutSectionFive() {
  // Left image - left entry with scale and blur
  const imageVariants = {
    hidden: {
      opacity: 0,
      x: -50,
      scale: 0.9,
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
        delay: 0.1,
      },
    },
  };

  // Heading - right entry with blur
  const headingVariants = {
    hidden: {
      opacity: 0,
      x: 40,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Paragraph - bottom entry with blur
  const paragraphVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(6px)",
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

  // Right content stagger - coordinated with left
  const rightContentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.4,
      },
    },
  };

  // Paragraph container stagger
  const paragraphContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <section className="relative px-4 md:px-10 bg-[url('/about/section-5-bg.svg')] bg-cover bg-center bg-no-repeat py-20">
      <div className="container">
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center xl:max-w-[80%] xl:gap-[15%] mx-auto">
          {/* Left side - Image with left entry animation */}
          <motion.div
            className="relative flex items-center justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={imageVariants}
          >
            <Image
              src="/about/section-5-img.png"
              alt="Section 5 Icon"
              width={500}
              height={500}
              className="w-auto h-auto xl:h-[70vh] object-cover"
            />
          </motion.div>

          {/* Right side - Text content with coordinated timing */}
          <motion.div
            className="flex flex-col gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={rightContentVariants}
          >
            {/* Heading - right entry with blur */}
            <motion.h2
              className="text-text text-3xl lg:text-4xl relative"
              variants={headingVariants}
            >
              the <span className="block ml-10">lovebird</span>
            </motion.h2>

            {/* Paragraphs - bottom entry with stagger */}
            <motion.div
              className="flex flex-col gap-3"
              variants={paragraphContainerVariants}
            >
              <motion.p
                className="text-[#13120F] text-base 2xl:text-xl"
                variants={paragraphVariants}
              >
                The lovebird holding a rose embodies Antiromantic's essence.
                Traditionally, lovebirds are seen in pairs, symbolizing
                companionship.
              </motion.p>
              <motion.p
                className="text-[#13120F] text-base 2xl:text-xl"
                variants={paragraphVariants}
              >
                But here, we flip the meaning the lovebird stands on its own,
                confident, and in full bloom. It isn't about turning away from
                love but making space for it in a way that feels right. Because
                romance, like everything else, is yours to define.
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AboutSectionFive;
