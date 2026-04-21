import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

export function CookieBanner() {
  const { consent, setConsent } = useCookieConsent();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(false);

  if (consent) return null;

  const acceptAll = () => setConsent({ analytics: true });
  const essentialOnly = () => setConsent({ analytics: false });
  const savePrefs = () => {
    setConsent({ analytics: analyticsChoice });
    setPrefsOpen(false);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="dialog"
      aria-label="Cookie consent"
      data-testid="cookie-banner"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="text-foreground font-medium mb-1">We use cookies</p>
              <p className="leading-relaxed">
                We use essential cookies to run the site and optional analytics cookies to
                understand usage. See our{" "}
                <Link href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:shrink-0">
            <Dialog
              open={prefsOpen}
              onOpenChange={(open) => {
                setPrefsOpen(open);
                if (open) setAnalyticsChoice(false);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="link"
                  size="sm"
                  className="text-muted-foreground"
                  data-testid="button-cookie-preferences"
                >
                  Cookie preferences
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cookie preferences</DialogTitle>
                  <DialogDescription>
                    Choose which categories of cookies you allow. Essential cookies are
                    required for the site to work.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="flex items-start justify-between gap-4 rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">Essential</p>
                      <p className="text-xs text-muted-foreground">
                        Required for authentication, security, and core site functionality.
                      </p>
                    </div>
                    <Switch
                      checked
                      disabled
                      aria-label="Essential cookies (always on)"
                      data-testid="switch-cookie-essential"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4 rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">Analytics</p>
                      <p className="text-xs text-muted-foreground">
                        Helps us understand how the site is used so we can improve it.
                      </p>
                    </div>
                    <Switch
                      checked={analyticsChoice}
                      onCheckedChange={setAnalyticsChoice}
                      aria-label="Analytics cookies"
                      data-testid="switch-cookie-analytics"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      essentialOnly();
                      setPrefsOpen(false);
                    }}
                    data-testid="button-cookie-prefs-essential"
                  >
                    Essential only
                  </Button>
                  <Button onClick={savePrefs} data-testid="button-cookie-prefs-save">
                    Save preferences
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              onClick={essentialOnly}
              data-testid="button-cookie-essential"
            >
              Essential only
            </Button>
            <Button size="sm" onClick={acceptAll} data-testid="button-cookie-accept-all">
              Accept all
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
