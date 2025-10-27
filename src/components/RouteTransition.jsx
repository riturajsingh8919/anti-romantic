"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Loader from "@/components/Loader";

export default function RouteTransition({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const [loading, setLoading] = useState(!isAdminRoute); // Don't show loader for admin routes

  useEffect(() => {
    // Show loader on route change only if not an admin route
    if (!isAdminRoute) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [pathname, isAdminRoute]);

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
