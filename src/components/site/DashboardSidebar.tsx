import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, Ticket, User2, Calendar, ShieldCheck, Users, LogOut, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type NavItem = { to: string; label: string; icon: typeof Home };

export function DashboardSidebar({ roles }: { roles: string[] }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = roles.includes("admin");
  const isTeam = roles.includes("team") || isAdmin;

  const base: NavItem[] = [
    { to: "/dashboard", label: "Home", icon: Home },
    { to: "/dashboard/events", label: "Events", icon: Calendar },
    { to: "/dashboard/tickets", label: "Tickets", icon: Ticket },
    { to: "/dashboard/profile", label: "Profile", icon: User2 },
  ];
  const staff: NavItem[] = [];
  if (isTeam) staff.push({ to: "/dashboard/team", label: "Check-in", icon: Users });
  if (isAdmin) staff.push({ to: "/dashboard/admin", label: "Admin", icon: ShieldCheck });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const isActive = (to: string) =>
    to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(to);

  return (
    <aside className="lg:sticky lg:top-24 lg:w-64 shrink-0">
      <div className="glass rounded-3xl p-4 lg:h-[calc(100vh-8rem)] flex flex-col">
        <Link to="/" className="flex items-center gap-2 px-2 py-2 mb-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-bold">YNC</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Member area</span>
          </div>
        </Link>

        <nav className="flex flex-col gap-1">
          {base.map((it) => (
            <SidebarLink key={it.to} {...it} active={isActive(it.to)} />
          ))}
        </nav>

        {staff.length > 0 && (
          <>
            <div className="mt-4 mb-2 px-3 text-[10px] uppercase tracking-widest text-muted-foreground">Staff</div>
            <nav className="flex flex-col gap-1">
              {staff.map((it) => (
                <SidebarLink key={it.to} {...it} active={isActive(it.to)} />
              ))}
            </nav>
          </>
        )}

        <div className="flex-1" />
        <button
          onClick={signOut}
          className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ to, label, icon: Icon, active }: NavItem & { active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
        active
          ? "bg-gradient-to-r from-primary/20 to-accent/20 border border-accent/30 text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
