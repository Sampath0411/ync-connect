import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMe } from "@/lib/community.functions";
import { DashboardSidebar } from "@/components/site/DashboardSidebar";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
  head: () => ({ meta: [{ title: "Dashboard — YNC" }] }),
});

function DashboardLayout() {
  const meFn = useServerFn(getMe);
  const meQ = useQuery({ queryKey: ["me"], queryFn: () => meFn() });
  const roles = meQ.data?.roles ?? [];

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 flex flex-col lg:flex-row gap-6">
        <DashboardSidebar roles={roles} />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
