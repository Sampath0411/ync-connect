import { Link } from "@tanstack/react-router";
import { Sparkles, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold">YNC</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Youth Network Community — a movement empowering the next generation
            through events, mentorship, and meaningful connection.
          </p>
          <div className="mt-6 flex gap-3">
            {[Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-10 w-10 place-items-center rounded-xl glass hover:bg-white/10 transition"
                aria-label="social"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/membership" className="hover:text-foreground">Membership</Link></li>
            <li><Link to="/events" className="hover:text-foreground">Events</Link></li>
            <li><Link to="/gallery" className="hover:text-foreground">Gallery</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/join" className="hover:text-foreground">Join Now</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Member Login</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Youth Network Community. All rights reserved.</p>
          <p>Built with care for the community.</p>
        </div>
      </div>
    </footer>
  );
}
