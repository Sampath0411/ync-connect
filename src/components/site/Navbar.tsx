import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, Sparkles, LayoutDashboard } from "lucide-react";
import { useSession } from "@/lib/use-session";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { hash: "home", label: "Home" },
  { hash: "about", label: "About" },
  { hash: "membership", label: "Membership" },
  { hash: "events", label: "Events" },
  { hash: "gallery", label: "Gallery" },
  { hash: "contact", label: "Contact" },
] as const;


export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { session } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const handleNav = (e: React.MouseEvent, hash: string) => {
    setOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${hash}`);
    }
  };


  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "py-3" : "py-5"}`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className={`glass rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? "shadow-[0_10px_40px_-10px_oklch(0_0_0/0.4)]" : ""}`}>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_oklch(0.55_0.22_265/0.5)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-tight">YNC</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Youth Network</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => {
              const href = pathname === "/" ? `#${l.hash}` : `/#${l.hash}`;
              return (
                <a
                  key={l.hash}
                  href={href}
                  onClick={(e) => handleNav(e, l.hash)}
                  className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                >
                  {l.label}
                </a>
              );
            })}
          </nav>


          <div className="hidden lg:flex items-center gap-2">
            {session ? (
              <>
                <Link to="/dashboard" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <button onClick={signOut} className="glow-btn px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-primary to-accent text-white">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
                <Link to="/auth" className="glow-btn px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-primary to-accent text-white">
                  Join Now
                </Link>
              </>
            )}
          </div>

          <button className="lg:hidden p-2 rounded-lg hover:bg-white/5" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass mt-2 rounded-2xl p-4 lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {links.map((l) => {
                  const href = pathname === "/" ? `#${l.hash}` : `/#${l.hash}`;
                  return (
                    <a key={l.hash} href={href} onClick={(e) => handleNav(e, l.hash)} className="px-3 py-2.5 rounded-lg text-sm hover:bg-white/5">
                      {l.label}
                    </a>
                  );
                })}

                <div className="h-px bg-border my-2" />
                {session ? (
                  <>
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm hover:bg-white/5">
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { setOpen(false); signOut(); }}
                      className="mt-1 px-3 py-2.5 rounded-lg text-sm text-center bg-gradient-to-r from-primary to-accent text-white font-medium"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm hover:bg-white/5">Sign in</Link>
                    <Link
                      to="/auth"
                      onClick={() => setOpen(false)}
                      className="mt-1 px-3 py-2.5 rounded-lg text-sm text-center bg-gradient-to-r from-primary to-accent text-white font-medium"
                    >
                      Join Now
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
