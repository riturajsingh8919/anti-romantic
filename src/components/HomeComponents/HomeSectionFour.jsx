"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

function HomeSectionFour() {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const rightColumnRef = useRef(null);
  const imageRefs = useRef([]);
  const router = useRouter();

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Define the images and corresponding left side images with product data
  const leftImages = [
    {
      src: "/home/left1.png",
      title: "exclusive",
      subtitle: "linen shirt",
      productName: "linen shirt",
      price: "2,999",
      slug: "linen-shirt",
    },
    {
      src: "/home/left2.png",
      title: "premium",
      subtitle: "cotton wear",
      productName: "belt tunic dress",
      price: "2,499",
      slug: "belt-tunic-dress",
    },
    {
      src: "/home/left3.png",
      title: "elegant",
      subtitle: "casual style",
      productName: "long mesh dress",
      price: "2,999",
      slug: "long-mesh-dress",
    },
  ];

  const rightImages = [
    "/home/right1.png",
    "/home/right2.png",
    "/home/right3.png",
  ];

  useEffect(() => {
    // Only enable scroll detection on desktop
    if (isMobile) return;

    const handleScroll = () => {
      const viewportCenter = window.innerHeight / 2;

      // Check which image is closest to the center of the viewport
      let closestIndex = 0;
      let closestDistance = Infinity;

      imageRefs.current.forEach((imageRef, index) => {
        if (imageRef) {
          const imageRect = imageRef.getBoundingClientRect();
          const imageCenter = imageRect.top + imageRect.height / 2;
          const distance = Math.abs(imageCenter - viewportCenter);

          // Only consider images that are at least partially visible
          if (imageRect.bottom > 0 && imageRect.top < window.innerHeight) {
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = index;
            }
          }
        }
      });

      if (closestIndex !== activeImageIndex) {
        setActiveImageIndex(closestIndex);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [activeImageIndex, isMobile]);

  const setImageRef = (index) => (el) => {
    imageRefs.current[index] = el;
  };

  const handleProductClick = (slug) => {
    router.push(`/store/${slug}`);
  };

  // Mobile version - simple vertical layout
  if (isMobile) {
    return (
      <section className="relative bg-[url('/bg-img.png')] bg-no-repeat bg-cover py-8">
        <div className="container">
          <p className="text-text text-base px-4 mb-8">
            Our thoughtfully crafted pieces embrace both ease and elegance,
            making self-care part of your everyday wear.
          </p>

          {/* Mobile: Show all images in sequence */}
          {leftImages.map((leftImg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              {/* Left image with title - clickable for navigation */}
              <div
                className="relative mb-6 cursor-pointer"
                onClick={() => handleProductClick(leftImg.slug)}
              >
                <Image
                  src={leftImg.src}
                  alt="image"
                  width={960}
                  height={1169}
                  className="w-full h-auto object-cover"
                />

                {/* Product info overlay - always visible on mobile */}
                <div className="absolute top-[10%] left-[4%] text-[#817C73]">
                  <h3 className="text-lg font-normal">{leftImg.productName}</h3>
                  <p className="text-base mt-1">inr {leftImg.price}</p>
                </div>
              </div>

              {/* Corresponding right image - not clickable */}
              <div className="flex justify-center px-4">
                <Image
                  src={rightImages[index]}
                  alt={`Product ${index + 1}`}
                  width={350}
                  height={450}
                  className="w-auto h-[60vh] object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  // Desktop version - sticky left column with scroll detection
  return (
    <section className="relative bg-[url('/bg-img.png')] bg-repeat bg-contain">
      <div className="relative grid grid-cols-2 min-h-screen">
        {/* Left Section - Sticky with fast fade animation */}
        <div
          className="flex w-full h-screen sticky top-0 self-start overflow-hidden cursor-pointer"
          onMouseEnter={() => setHoveredIndex(activeImageIndex)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => handleProductClick(leftImages[activeImageIndex].slug)}
        >
          <div className="w-full h-full relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full h-full absolute inset-0"
              >
                <Image
                  src={leftImages[activeImageIndex].src}
                  alt="image"
                  width={960}
                  height={1169}
                  className="w-full h-auto object-cover"
                />

                {/* Product info overlay on hover */}
                <AnimatePresence>
                  {hoveredIndex === activeImageIndex && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-[10%] left-[2%] text-[#817C73]"
                    >
                      <h3 className="text-lg xl:text-2xl font-normal">
                        {leftImages[activeImageIndex].productName}
                      </h3>
                      <p className="text-base xl:text-lg mt-2">
                        inr {leftImages[activeImageIndex].price}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section - Reduced padding, fits in one screen */}
        <div
          ref={rightColumnRef}
          className="flex flex-col justify-center items-start gap-8 px-8 xl:px-12 min-h-screen py-20"
        >
          <p className="text-text text-base max-w-md">
            Our thoughtfully crafted pieces embrace both ease and elegance,
            making self-care part of your everyday wear.
          </p>

          <div className="flex flex-col gap-12 w-full">
            {rightImages.map((imageSrc, index) => (
              <div
                key={index}
                ref={setImageRef(index)}
                className="relative flex items-center justify-center"
              >
                <Image
                  src={imageSrc}
                  alt={`Product ${index + 1}`}
                  width={350}
                  height={450}
                  className="w-auto h-[50vh] object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeSectionFour;
