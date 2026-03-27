
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * REDIRECT GHOST FILE
 * This file is a duplicate of the admin verify page. 
 * Redirecting to the correct institutional terminal.
 */
export default function GhostRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/admin/verify");
  }, [router]);
  return null;
}
