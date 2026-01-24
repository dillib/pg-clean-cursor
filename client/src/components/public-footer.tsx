import { Link } from "wouter";
import { QrCode } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <QrCode className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">PhotonicTag</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/scan/demo" className="hover:text-foreground transition-colors">Examples</Link>
            <Link href="/integrations" className="hover:text-foreground transition-colors">Integrations</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © 2026 PhotonicTag. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
