import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ync-cookie-consent");
    if (!consent) {
      // Delay showing to avoid layout shift
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("ync-cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("ync-cookie-consent", "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-[999] mx-auto max-w-lg"
        >
          <div className="glass rounded-2xl p-5 border border-border shadow-xl">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Cookie className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">We value your privacy</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We use cookies to enhance your browsing experience and analyze our traffic.
                  By clicking "Accept", you consent to our use of cookies.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={accept}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-medium"
                  >
                    Accept
                  </button>
                  <button
                    onClick={decline}
                    className="px-4 py-1.5 rounded-xl border border-border text-xs hover:bg-white/5"
                  >
                    Decline
                  </button>
                </div>
              </div>
              <button
                onClick={decline}
                className="p-1 rounded-lg hover:bg-white/5 shrink-0"
                aria-label="Close cookie notice"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
