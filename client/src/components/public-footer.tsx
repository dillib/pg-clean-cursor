import { Link } from "wouter";
import { QrCode } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <QrCode className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">PhotonicTag</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Identity, at the speed of light.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/presentation" className="hover:text-foreground transition-colors">Presentation</Link>
              <Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
              <Link href="/faqs" className="hover:text-foreground transition-colors">FAQs</Link>
              <Link href="/scan/demo" className="hover:text-foreground transition-colors">Examples</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Company</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/integrations" className="hover:text-foreground transition-colors">Integrations</Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 PhotonicTag. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
