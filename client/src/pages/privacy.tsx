import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Legal</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4" data-testid="text-privacy-title">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">Last updated: January 1, 2026</p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <h2>1. Introduction</h2>
          <p>
            PhotonicTag GmbH ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our digital 
            product passport platform and related services.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li>Account information (name, email, company)</li>
            <li>Product data you upload to create digital passports</li>
            <li>Communication records when you contact us</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <ul>
            <li>Device and browser information</li>
            <li>IP address and location data</li>
            <li>Usage patterns and analytics</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process and manage your digital product passports</li>
            <li>Improve and personalize user experience</li>
            <li>Communicate with you about updates and support</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with:
          </p>
          <ul>
            <li>Service providers who assist in our operations</li>
            <li>Business partners with your consent</li>
            <li>Legal authorities when required by law</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures including encryption, access controls, 
            and regular security audits to protect your data.
          </p>

          <h2>6. Your Rights</h2>
          <p>Under GDPR and applicable laws, you have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>

          <h2>7. Data Retention</h2>
          <p>
            We retain your data for as long as necessary to provide our services and comply with 
            legal obligations. You may request deletion at any time.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            For privacy-related inquiries, contact our Data Protection Officer at:
            <br />
            <a href="mailto:privacy@photonictag.com">privacy@photonictag.com</a>
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant changes 
            via email or through our platform.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
