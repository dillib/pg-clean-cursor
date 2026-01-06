import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Legal</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4" data-testid="text-terms-title">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">Last updated: January 1, 2026</p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using PhotonicTag's digital product passport platform ("Service"), you agree 
            to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            PhotonicTag provides a digital product passport platform that enables businesses to create, 
            manage, and share product identity information including supply chain data, sustainability 
            metrics, and compliance documentation.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            To use certain features of the Service, you must register for an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Upload false or misleading product information</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Reverse engineer or copy our technology</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by PhotonicTag 
            and are protected by international copyright, trademark, and other intellectual property laws.
          </p>

          <h2>6. User Content</h2>
          <p>
            You retain ownership of content you upload to the Service. By uploading content, you grant 
            us a license to use, store, and display that content as necessary to provide the Service.
          </p>

          <h2>7. Payment Terms</h2>
          <p>
            Paid plans are billed in advance on a monthly or annual basis. All fees are non-refundable 
            except as required by law or as explicitly stated in our refund policy.
          </p>

          <h2>8. Service Availability</h2>
          <p>
            We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We may 
            perform maintenance with reasonable advance notice when possible.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, PhotonicTag shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages resulting from your use of the Service.
          </p>

          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless PhotonicTag from any claims, damages, or expenses 
            arising from your use of the Service or violation of these terms.
          </p>

          <h2>11. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violations of these terms. 
            You may cancel your account at any time through your account settings.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These terms shall be governed by the laws of Germany. Any disputes shall be resolved 
            in the courts of Berlin, Germany.
          </p>

          <h2>13. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify you of significant 
            changes via email or through the Service.
          </p>

          <h2>14. Contact</h2>
          <p>
            For questions about these Terms of Service, contact us at:
            <br />
            <a href="mailto:legal@photonictag.com">legal@photonictag.com</a>
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
