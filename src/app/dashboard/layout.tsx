import type { Metadata } from "next";
import { headers } from "next/headers";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { HeaderCrumb } from "@/components/layout/header-crumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard · Growth App",
};

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <SidebarProvider>
      <AppSidebar
        userName={session?.user.name ?? ""}
        userEmail={session?.user.email ?? ""}
        timezone={session?.user.timezone ?? ""}
      />
      <SidebarInset>
        <header className="dashboard-header sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex w-full items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="!h-4 data-[orientation=vertical]:w-px"
            />
            <HeaderCrumb />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

