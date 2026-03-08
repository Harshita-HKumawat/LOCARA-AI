import { Shield, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 section-padding pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold gradient-text">LOCARA-AI</span>
            </div>
            <p className="text-sm text-muted-foreground">AI-powered predictive safety intelligence protecting women through prevention.</p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-foreground">Platform</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/features" className="hover:text-primary transition-colors">Features</Link>
              <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
              <Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-foreground">Company</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/impact" className="hover:text-primary transition-colors">Impact</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-foreground">Connect</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>support@locara-ai.com</span>
              <span>+1 (800) LOCARA</span>
            </div>
          </div>
        </div>
        <div className="mt-12 flex items-center justify-center gap-1 text-sm text-muted-foreground">
          Made with <Heart className="h-4 w-4 text-rose" /> for a safer world
        </div>
      </div>
    </footer>
  );
}
