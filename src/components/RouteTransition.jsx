"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Loader from "@/components/Loader";

export default function RouteTransition({ children }) {
  const [loading, setLoading] = useState(true); // Start with loader visible
  const pathname = usePathname();

  useEffect(() => {
    // Show loader on route change
    setLoading(true);
  }, [pathname]);

  const handleLoadComplete = () => {
    setLoading(false);
  };

  return (
    <>
      {loading && <Loader onLoadComplete={handleLoadComplete} />}
      <div style={{ display: loading ? "none" : "block" }}>{children}</div>
    </>
  );
}
