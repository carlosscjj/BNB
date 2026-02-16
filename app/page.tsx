
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
      return;
    }

    if ((session?.user as any)?.role === "ADMIN") {
      router.replace("/dashboard");
    } else {
      router.replace("/calendar");
    }
  }, [session, status, router]);

  return null;
}
