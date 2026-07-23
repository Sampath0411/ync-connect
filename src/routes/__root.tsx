import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "../components/site/Navbar";
import { Footer } from "../components/site/Footer";
import { ThemeToggle } from "../components/site/ThemeToggle";
import { CookieConsent } from "../components/site/CookieConsent";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center hero-bg px-4">
      <div className="glass max-w-md text-center p-10 rounded-3xl">
        <h1 className="text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-primary to-accent text-white glow-btn"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center hero-bg px-4">
      <div className="glass max-w-md text-center p-10 rounded-3xl">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. You can try again or head home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-white glow-btn"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-white/5"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "YNC — Youth Network Community" },
      {
        name: "description",
        content:
          "Join a growing youth movement. Free membership for a limited period, exclusive events, mentorship, and community.",
      },
      { name: "author", content: "YNC" },
      { property: "og:title", content: "YNC — Youth Network Community" },
      {
        property: "og:description",
        content:
          "Join a growing youth movement. Free membership for a limited period, exclusive events, mentorship, and community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "YNC — Youth Network Community" },
      { name: "twitter:description", content: "Join a growing youth movement. Free membership for a limited period, exclusive events, mentorship, and community." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/17c94aa6-9e34-4258-9c51-b75d1b09b0e5/id-preview-70e28ae6--a049c226-de8d-459c-9b40-b51184a8d138.lovable.app-1784377167817.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/17c94aa6-9e34-4258-9c51-b75d1b09b0e5/id-preview-70e28ae6--a049c226-de8d-459c-9b40-b51184a8d138.lovable.app-1784377167817.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Figtree:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const hideChrome =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster theme="dark" position="top-right" richColors />
      <div className="relative min-h-screen hero-bg overflow-x-clip">
        {/* Ambient floating gradient shapes */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/25 blur-3xl animate-float" />
          <div
            className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-accent/20 blur-3xl animate-float"
            style={{ animationDelay: "-6s" }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,oklch(0.12_0.03_265/0.4)_100%)]" />
        </div>

        {/* Skip-to-content link for keyboard users */}
        <a href="#main-content" className="skip-to-content focus:top-0">
          Skip to content
        </a>

        {!hideChrome && <Navbar />}

        {/* Theme toggle */}
        {!hideChrome && (
          <div className="fixed bottom-6 right-6 z-50">
            <ThemeToggle />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            id="main-content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>

        {!hideChrome && <Footer />}

        <CookieConsent />
      </div>
    </QueryClientProvider>
  );
}

