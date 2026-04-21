import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function DPA() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Data Processing Agreement - PhotonicTag</title>
        <meta name="description" content="PhotonicTag Data Processing Agreement template pursuant to Article 28 GDPR. Covers sub-processors, security measures, and breach procedures." />
        <link rel="canonical" href="https://www.photonictag.com/dpa" />
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
          <h1 className="text-4xl font-bold tracking-tight mb-4" data-testid="text-dpa-title">
            Data Processing Agreement
          </h1>
          <p className="text-muted-foreground">
            Template pursuant to Article 28 GDPR · Last updated: April 20, 2026
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          {/* TODO: counsel review */}
          <h2>1. Subject Matter</h2>
          <p>
            This Data Processing Agreement (&quot;DPA&quot;) forms part of the agreement between the Customer
            (&quot;Controller&quot;) and PhotonicTag GmbH (&quot;Processor&quot;) for the provision of the PhotonicTag
            Digital Product Passport platform. It sets out the terms on which the Processor processes personal data
            on behalf of the Controller in accordance with Article 28 of Regulation (EU) 2016/679 (&quot;GDPR&quot;).
          </p>

          {/* TODO: counsel review */}
          <h2>2. Duration</h2>
          <p>
            This DPA applies for the duration of the main services agreement and remains in force for as long as
            the Processor processes personal data on behalf of the Controller.
          </p>

          {/* TODO: counsel review */}
          <h2>3. Nature and Purpose of Processing</h2>
          <p>
            The Processor processes personal data solely to provide the PhotonicTag platform, including hosting,
            authentication, analytics on consented basis, product passport management, and customer support.
          </p>

          {/* TODO: counsel review */}
          <h2>4. Data Subjects</h2>
          <ul>
            <li>Employees, contractors, and other personnel of the Controller who use the platform</li>
            <li>End-users who interact with public scan pages</li>
            <li>Contacts in the Controller&apos;s customer-facing workflows</li>
          </ul>

          {/* TODO: counsel review */}
          <h2>5. Categories of Personal Data</h2>
          <ul>
            <li>Identification and contact data (name, business email, company, role)</li>
            <li>Authentication data (hashed credentials, session identifiers)</li>
            <li>Technical data (IP addresses, browser user agents, log timestamps)</li>
            <li>Usage data limited to what is necessary for service operation and, where consented, analytics</li>
          </ul>

          {/* TODO: counsel review */}
          <h2>6. Obligations of the Processor</h2>
          <ul>
            <li>Process personal data only on documented instructions from the Controller</li>
            <li>Ensure personnel authorised to process personal data are under a duty of confidentiality</li>
            <li>Implement appropriate technical and organisational measures (see Section 8)</li>
            <li>Assist the Controller in responding to data subject requests</li>
            <li>Assist the Controller with data protection impact assessments and prior consultations</li>
            <li>Delete or return all personal data at the end of the services, at the Controller&apos;s choice</li>
            <li>Make available all information necessary to demonstrate compliance with Article 28 GDPR</li>
          </ul>

          {/* TODO: counsel review */}
          <h2>7. Sub-Processors</h2>
          <p>
            The Controller provides general authorisation for the Processor to engage the following sub-processors,
            each bound by contractual terms equivalent to those set out in this DPA:
          </p>
          <ul>
            <li><strong>Fly.io</strong> — application hosting and edge delivery</li>
            <li><strong>Neon</strong> — managed PostgreSQL database hosting</li>
            <li><strong>Brevo</strong> — transactional email delivery</li>
            <li><strong>WorkOS</strong> — identity and enterprise SSO</li>
          </ul>
          <p>
            The Processor will inform the Controller of any intended changes to sub-processors and give the
            Controller an opportunity to object.
          </p>

          {/* TODO: counsel review */}
          <h2>8. Security Measures (Art. 32 GDPR)</h2>
          <p>
            The Processor implements appropriate technical and organisational measures, including (placeholder —
            subject to validation by security team):
          </p>
          <ul>
            <li>Encryption of personal data in transit (TLS 1.2+) and at rest</li>
            <li>Access control via role-based permissions and least-privilege provisioning</li>
            <li>Secrets management with scoped environment credentials</li>
            <li>Audit logging of administrative actions</li>
            <li>Regular vulnerability scanning and dependency review</li>
            <li>Alignment with ISO 27001 control objectives (certification in progress)</li>
            <li>Business continuity and disaster recovery procedures</li>
          </ul>

          {/* TODO: counsel review */}
          <h2>9. Personal Data Breach Procedures</h2>
          <p>
            The Processor will notify the Controller without undue delay, and in any event within 72 hours of
            becoming aware of a personal data breach affecting the Controller&apos;s data. The notification will
            include the nature of the breach, categories and approximate number of data subjects affected,
            likely consequences, and measures taken or proposed to mitigate the breach.
          </p>

          {/* TODO: counsel review */}
          <h2>10. Audits</h2>
          <p>
            The Processor will make available to the Controller all information necessary to demonstrate
            compliance with this DPA and will allow for and contribute to audits, including inspections, conducted
            by the Controller or an auditor mandated by the Controller, subject to reasonable notice and
            confidentiality obligations.
          </p>

          {/* TODO: counsel review */}
          <h2>11. International Transfers</h2>
          <p>
            Where personal data is transferred outside the European Economic Area, the parties will rely on the
            European Commission&apos;s Standard Contractual Clauses together with supplementary technical and
            organisational measures as required by applicable law.
          </p>

          {/* TODO: counsel review */}
          <h2>12. Termination</h2>
          <p>
            Upon termination of the services, the Processor will, at the choice of the Controller, delete or
            return all personal data and delete existing copies unless Union or Member State law requires storage
            of the personal data.
          </p>

          {/* TODO: counsel review */}
          <h2>13. Contact</h2>
          <p>
            Requests relating to this DPA should be directed to{" "}
            <a href="mailto:privacy@photonictag.com">privacy@photonictag.com</a>.
          </p>
        </div>

        <section className="mt-16">
          <div className="bg-primary/5 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Need a signed DPA?</h2>
            <p className="text-muted-foreground mb-6">
              Enterprise customers receive a counter-signed Data Processing Agreement as part of onboarding.
            </p>
            <Button size="lg" asChild>
              <Link href="/contact" className="gap-2">
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
