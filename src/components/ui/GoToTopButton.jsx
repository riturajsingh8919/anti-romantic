"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function GoToTopButton() {
  const [showGoToTop, setShowGoToTop] = useState(false);
  const [isGoToTopVisible, setIsGoToTopVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // Go to top button logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 200) {
        if (!showGoToTop) {
          setShowGoToTop(true);
          setIsGoToTopVisible(true);

          // Clear existing timeout
          if (hideTimeout) {
            clearTimeout(hideTimeout);
          }

          // Set new timeout to hide after 5 seconds
          const newTimeout = setTimeout(() => {
            setIsGoToTopVisible(false);
          }, 5000);
          setHideTimeout(newTimeout);
        } else if (!isGoToTopVisible) {
          // Show again on further scroll
          setIsGoToTopVisible(true);

          // Clear existing timeout
          if (hideTimeout) {
            clearTimeout(hideTimeout);
          }

          // Set new timeout to hide after 5 seconds
          const newTimeout = setTimeout(() => {
            setIsGoToTopVisible(false);
          }, 5000);
          setHideTimeout(newTimeout);
        }
      } else {
        setShowGoToTop(false);
        setIsGoToTopVisible(false);
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          setHideTimeout(null);
        }
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll);

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [showGoToTop, isGoToTopVisible, hideTimeout]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!showGoToTop) {
    return null;
  }

  return (
    <div
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out transform hover:scale-110 cursor-pointer ${
        isGoToTopVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
      title="Go to top"
    >
      <Image
        src={isHovered ? "/top-hover.svg" : "/top.svg"}
        alt="Go to top"
        width={40}
        height={40}
        className="transition-all duration-300 ease-in-out"
      />
    </div>
  );
}
