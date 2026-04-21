import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { AlertTriangle } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy - PhotonicTag</title>
        <meta name="description" content="PhotonicTag GDPR privacy policy. Learn how we collect, use, and protect your data on our EU Digital Product Passport platform." />
        <link rel="canonical" href="https://www.photonictag.com/privacy" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <PublicNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 flex items-start gap-3" data-testid="banner-template-review">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Template — subject to legal review.</p>
            <p className="text-muted-foreground">
              This document is a working template. Final language will be reviewed and approved by external counsel before go-live.
            </p>
          </div>
        </div>

        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Legal</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4" data-testid="text-privacy-title">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">Last updated: April 20, 2026</p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          {/* TODO: counsel review */}
          <h2>1. Data Controller</h2>
          <p>
            The data controller for personal data processed through the PhotonicTag platform is:
          </p>
          <p>
            <strong>PhotonicTag GmbH</strong>
            <br />
            Registered office: Berlin, Germany
            <br />
            EU contact / Data Protection Officer: <a href="mailto:privacy@photonictag.com">privacy@photonictag.com</a>
          </p>

          {/* TODO: counsel review */}
          <h2>2. Data We Collect</h2>
          <h3>2.1 Account data</h3>
          <ul>
            <li>Name, business email address, company, role</li>
            <li>Authentication identifiers and hashed credentials</li>
          </ul>
          <h3>2.2 Usage data</h3>
          <ul>
            <li>Log data (IP address, user agent, timestamps)</li>
            <li>Product interactions and platform telemetry required for security and service operation</li>
          </ul>
          <h3>2.3 Cookies</h3>
          <ul>
            <li>Essential cookies for authentication and session management</li>
            <li>Optional analytics cookies — only with your explicit consent</li>
          </ul>

          {/* TODO: counsel review */}
          <h2>3. Legal Bases for Processing (Art. 6 GDPR)</h2>
          <ul>
            <li><strong>Art. 6(1)(b)</strong> — Performance of a contract with the customer</li>
            <li><strong>Art. 6(1)(c)</strong> — Compliance with legal obligations (e.g., tax, audit)</li>
            <li><strong>Art. 6(1)(f)</strong> — Legitimate interest in securing and improving the service</li>
            <li><strong>Art. 6(1)(a)</strong> — Consent, where required (e.g., non-essential cookies, marketing)</li>
          </ul>

          {/* TODO: counsel review */}
          <h2>4. Retention</h2>
          <p>
            Account data is retained for the duration of the customer relationship and for a defined period thereafter
            as required by law. Log data is retained for a limited rolling window for security and debugging purposes.
            Specific retention periods are set out in the Data Processing Agreement.
          </p>

          {/* TODO: counsel review */}
          <h2>5. Sharing &amp; Sub-Processors</h2>
          <p>
            We do not sell personal data. We share data only with vetted sub-processors acting under our instructions.
            A current list of sub-processors (including Fly.io, Neon, Brevo, and WorkOS) is maintained in our Data
            Processing Agreement.
          </p>

          {/* TODO: counsel review */}
          <h2>6. International Transfers</h2>
          <p>
            Where data is transferred outside the European Economic Area, we rely on the European Commission's
            Standard Contractual Clauses (SCCs) together with supplementary technical and organisational measures
            as required by Schrems II.
          </p>

          {/* TODO: counsel review */}
          <h2>7. Your Rights</h2>
          <p>Under the GDPR you have the right to:</p>
          <ul>
            <li>Access your personal data (Art. 15)</li>
            <li>Request rectification of inaccurate data (Art. 16)</li>
            <li>Request erasure (Art. 17)</li>
            <li>Data portability (Art. 20)</li>
            <li>Object to processing based on legitimate interest (Art. 21)</li>
            <li>Lodge a complaint with your supervisory Data Protection Authority (Art. 77)</li>
          </ul>

          {/* TODO: counsel review */}
          <h2>8. Security</h2>
          <p>
            We apply industry-standard technical and organisational measures including encryption in transit and at
            rest, role-based access control, audit logging, and regular security reviews.
          </p>

          {/* TODO: counsel review */}
          <h2>9. Contact</h2>
          <p>
            For privacy-related inquiries or to exercise your rights, contact our Data Protection Officer at{" "}
            <a href="mailto:privacy@photonictag.com">privacy@photonictag.com</a>.
          </p>

          {/* TODO: counsel review */}
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Significant changes will be communicated by email
            or through the platform.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
