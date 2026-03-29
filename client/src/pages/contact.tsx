import { useState } from "react";
import { useCurrency } from "@/hooks/use-currency";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Calendar, Building, Users, ChevronDown, ChevronUp, Database, Globe, Clock, Zap } from "lucide-react";
import { SiSap } from "react-icons/si";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const DPP_CATEGORIES = [
  { value: "electronics", label: "Electronics & IT Equipment" },
  { value: "batteries", label: "Batteries & Energy Storage" },
  { value: "textiles", label: "Textiles & Apparel" },
  { value: "machinery", label: "Machinery & Industrial" },
  { value: "furniture", label: "Furniture & Interiors" },
  { value: "chemicals", label: "Chemicals & Materials" },
  { value: "vehicles", label: "Vehicles & Mobility" },
  { value: "construction", label: "Construction Products" },
];

const contactFormSchema = z.object({
  // Basic info
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  tierInterest: z.enum(["poc", "starter", "growth", "enterprise"]).default("enterprise"),
  estimatedVolume: z.string().optional(),
  message: z.string().min(10, "Please provide some details about your needs"),
  source: z.enum(["pricing_page", "contact_form", "demo_request", "waitlist", "referral", "other"]).default("contact_form"),
  // Technical assessment (all optional)
  sapSystemType: z.string().optional(),
  sapDeployment: z.string().optional(),
  currentErp: z.string().optional(),
  euMarketsActive: z.string().optional(),
  dppCategories: z.array(z.string()).optional(),
  estimatedSkus: z.string().optional(),
  dppComplianceStatus: z.string().optional(),
  implementationTimeline: z.string().optional(),
  primaryUseCase: z.string().optional(),
  integrationNeeds: z.string().optional(),
  assessmentNotes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const CALENDLY_LINK = "/book-demo";

export default function Contact() {
  const { toast } = useToast();
  const { symbol } = useCurrency();
  const [showAssessment, setShowAssessment] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "",
      company: "", jobTitle: "", tierInterest: "enterprise",
      estimatedVolume: "", message: "", source: "contact_form",
      sapSystemType: "", sapDeployment: "", currentErp: "",
      euMarketsActive: "", dppCategories: [], estimatedSkus: "",
      dppComplianceStatus: "", implementationTimeline: "",
      primaryUseCase: "", integrationNeeds: "", assessmentNotes: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/leads", {
        ...data,
        assessmentCompletedAt: showAssessment && data.sapSystemType ? new Date().toISOString() : undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Request submitted",
        description: "Our team will reach out within 24 hours.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => submitMutation.mutate(data);
  const selectedCategories = form.watch("dppCategories") ?? [];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNav />
        <main className="max-w-2xl mx-auto px-4 py-32 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Request received</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for reaching out. Our team will review your details and respond within 24 hours.
            {showAssessment && " Your technical assessment has been saved and will help us prepare a tailored proposal."}
          </p>
          <Button asChild>
            <Link href={CALENDLY_LINK}>
              Book a Demo Now
            </Link>
          </Button>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contact Sales - PhotonicTag | EU DPP Compliance</title>
        <meta name="description" content="Get in touch with PhotonicTag. Book a demo, request a consultation, or discuss your EU Digital Product Passport compliance needs." />
      </Helmet>
      <PublicNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Contact Sales</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-contact-title">
            Let's Talk About Your DPP Needs
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to get started with PhotonicTag? Fill out the form below and our team will reach out within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left — Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Request a Consultation</CardTitle>
                <CardDescription>Tell us about your compliance and integration needs</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                    {/* ── Basic contact ── */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl><Input placeholder="Maria" {...field} data-testid="input-first-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl><Input placeholder="Schmidt" {...field} data-testid="input-last-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Email *</FormLabel>
                        <FormControl><Input type="email" placeholder="maria@company.com" {...field} data-testid="input-email" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="company" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl><Input placeholder="Acme AG" {...field} data-testid="input-company" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="jobTitle" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl><Input placeholder="Head of Compliance" {...field} data-testid="input-job-title" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="tierInterest" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan Interest</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-tier">
                                <SelectValue placeholder="Select a plan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="poc">POC (Free pilot)</SelectItem>
                              <SelectItem value="starter">Starter ({symbol}99/mo)</SelectItem>
                              <SelectItem value="growth">Growth ({symbol}499/mo)</SelectItem>
                              <SelectItem value="enterprise">Enterprise (Custom)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="estimatedVolume" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Product Volume</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-volume">
                                <SelectValue placeholder="Select volume" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="under-1k">Under 1,000</SelectItem>
                              <SelectItem value="1k-10k">1,000 – 10,000</SelectItem>
                              <SelectItem value="10k-100k">10,000 – 100,000</SelectItem>
                              <SelectItem value="100k-1m">100,000 – 1M</SelectItem>
                              <SelectItem value="over-1m">Over 1M</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel>How can we help? *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your compliance needs, timeline, and any specific questions..." className="min-h-28" {...field} data-testid="input-message" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* ── Technical Assessment Toggle ── */}
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowAssessment(!showAssessment)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                        data-testid="button-toggle-assessment"
                      >
                        <div className="flex items-center gap-2">
                          <SiSap className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">Technical Assessment</span>
                          <Badge variant="outline" className="text-xs">Recommended for SAP customers</Badge>
                        </div>
                        {showAssessment ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>

                      {showAssessment && (
                        <div className="p-4 space-y-4 border-t">
                          <p className="text-xs text-muted-foreground">
                            Completing this section helps us prepare a tailored implementation plan and proposal before our first call.
                          </p>

                          {/* SAP System */}
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="sapSystemType" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1"><SiSap className="w-3 h-3" /> SAP System</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-sap-system">
                                      <SelectValue placeholder="Select system" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="s4hana_cloud">S/4HANA Cloud</SelectItem>
                                    <SelectItem value="s4hana_onprem">S/4HANA On-Premise</SelectItem>
                                    <SelectItem value="ecc">ECC (classic)</SelectItem>
                                    <SelectItem value="business_one">Business One</SelectItem>
                                    <SelectItem value="no_sap">No SAP</SelectItem>
                                    <SelectItem value="other_erp">Other ERP</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />

                            <FormField control={form.control} name="sapDeployment" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Deployment Model</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-sap-deployment">
                                      <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="cloud">Cloud (SaaS)</SelectItem>
                                    <SelectItem value="on_premise">On-Premise</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>

                          <FormField control={form.control} name="currentErp" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current ERP / System Landscape</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. SAP ECC 6.0 EHP8, release 2021, with MM and PP modules" {...field} data-testid="input-current-erp" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          {/* EU Markets & DPP Status */}
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="euMarketsActive" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1"><Globe className="w-3 h-3" /> Selling in EU?</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-eu-markets">
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="yes">Yes, active EU sales</SelectItem>
                                    <SelectItem value="planned">Planned within 12 months</SelectItem>
                                    <SelectItem value="no">No EU markets currently</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />

                            <FormField control={form.control} name="dppComplianceStatus" render={({ field }) => (
                              <FormItem>
                                <FormLabel>DPP Compliance Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-compliance-status">
                                      <SelectValue placeholder="Current status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="not_started">Not yet started</SelectItem>
                                    <SelectItem value="planning">In planning</SelectItem>
                                    <SelectItem value="in_progress">Implementation in progress</SelectItem>
                                    <SelectItem value="compliant">Already compliant</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>

                          {/* Product Categories */}
                          <div>
                            <FormLabel className="text-sm font-medium">Product Categories Requiring DPP</FormLabel>
                            <p className="text-xs text-muted-foreground mb-2">Select all that apply</p>
                            <div className="grid grid-cols-2 gap-2">
                              {DPP_CATEGORIES.map(cat => (
                                <label key={cat.value} className="flex items-center gap-2 cursor-pointer group" data-testid={`checkbox-cat-${cat.value}`}>
                                  <Controller
                                    control={form.control}
                                    name="dppCategories"
                                    render={({ field }) => (
                                      <Checkbox
                                        checked={selectedCategories.includes(cat.value)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value ?? [];
                                          field.onChange(checked
                                            ? [...current, cat.value]
                                            : current.filter(v => v !== cat.value)
                                          );
                                        }}
                                      />
                                    )}
                                  />
                                  <span className="text-xs group-hover:text-foreground transition-colors">{cat.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* SKUs & Timeline */}
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="estimatedSkus" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estimated SKU Count</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-skus">
                                      <SelectValue placeholder="Number of SKUs" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="under_100">Under 100</SelectItem>
                                    <SelectItem value="100_1k">100 – 1,000</SelectItem>
                                    <SelectItem value="1k_10k">1,000 – 10,000</SelectItem>
                                    <SelectItem value="10k_100k">10,000 – 100,000</SelectItem>
                                    <SelectItem value="over_100k">Over 100,000</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />

                            <FormField control={form.control} name="implementationTimeline" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1"><Clock className="w-3 h-3" /> Implementation Timeline</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-timeline">
                                      <SelectValue placeholder="Target timeline" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="immediate">As soon as possible</SelectItem>
                                    <SelectItem value="1_3_months">Within 1–3 months</SelectItem>
                                    <SelectItem value="3_6_months">Within 3–6 months</SelectItem>
                                    <SelectItem value="6_12_months">Within 6–12 months</SelectItem>
                                    <SelectItem value="exploring">Just exploring for now</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>

                          {/* Use Case & Integration */}
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="primaryUseCase" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Use Case</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-use-case">
                                      <SelectValue placeholder="Main goal" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="regulatory">EU Regulatory Compliance</SelectItem>
                                    <SelectItem value="sustainability">Sustainability Reporting</SelectItem>
                                    <SelectItem value="supply_chain">Supply Chain Traceability</SelectItem>
                                    <SelectItem value="customer_transparency">Consumer Transparency</SelectItem>
                                    <SelectItem value="all">All of the above</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />

                            <FormField control={form.control} name="integrationNeeds" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Integration Requirements</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-integration">
                                      <SelectValue placeholder="Integration type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="sap_only">SAP integration only</SelectItem>
                                    <SelectItem value="erp_integration">Multiple ERP systems</SelectItem>
                                    <SelectItem value="api_only">API / webhook only</SelectItem>
                                    <SelectItem value="standalone">Standalone (no ERP)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>

                          <FormField control={form.control} name="assessmentNotes" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Technical Context</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Any other details about your system landscape, compliance deadline, or specific requirements..." className="min-h-20 text-sm" {...field} data-testid="input-assessment-notes" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={submitMutation.isPending} data-testid="button-submit">
                      {submitMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right — Contact options */}
          <div className="space-y-5">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Book a Demo Call</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      See PhotonicTag in action. 30-minute personalised demo with a product specialist.
                    </p>
                    <Button asChild data-testid="button-book-demo">
                      <Link href={CALENDLY_LINK}>Book a Demo</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email Us</h3>
                  <p className="text-muted-foreground text-sm mb-2">General enquiries and support</p>
                  <a href="mailto:hello@photonictag.com" className="text-primary hover:underline text-sm" data-testid="link-email-hello">hello@photonictag.com</a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Enterprise & SAP Sales</h3>
                  <p className="text-muted-foreground text-sm mb-2">SAP integration, custom scopes, and enterprise contracts</p>
                  <a href="mailto:enterprise@photonictag.com" className="text-primary hover:underline text-sm" data-testid="link-email-enterprise">enterprise@photonictag.com</a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">What happens with your assessment?</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">1.</span>
                    Our team reviews your SAP landscape and DPP requirements
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">2.</span>
                    We prepare a tailored implementation roadmap before the first call
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">3.</span>
                    You receive a scoped POC proposal within 48 hours of the demo
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="p-5 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Why companies choose PhotonicTag</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>EU ESPR compliant from day one</li>
                <li>SAP S/4HANA, ECC &amp; Business One integration</li>
                <li>AI-powered insights and sustainability scoring</li>
                <li>Free POC to prove value before commitment</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
