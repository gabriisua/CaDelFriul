"use client";

import SidebarNav from "./SidebarNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 bg-background p-6 md:p-10">{children}</main>
    </div>
  );
}
