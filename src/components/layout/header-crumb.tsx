"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/goals": "Goals",
};

/** Breadcrumb label for the current dashboard page (wayfinding). */
export function HeaderCrumb() {
  const pathname = usePathname();
  const label = LABELS[pathname] ?? "Dashboard";

  return (
    <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
      <Link
        href="/dashboard"
        className={cn(
          "transition-colors",
          pathname === "/dashboard"
            ? "text-foreground"
            : "hover:text-foreground",
        )}
      >
        Dashboard
      </Link>
      {pathname !== "/dashboard" ? (
        <>
          <span aria-hidden className="text-muted-foreground/60">
            /
          </span>
          <span className="text-foreground">{label}</span>
        </>
      ) : null}
    </span>
  );
}
