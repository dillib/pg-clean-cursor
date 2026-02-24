import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Calendar, Building, Users } from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const contactFormSchema = z.object({
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
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const CALENDLY_LINK = "https://calendar.app.google/Aa9nfUnJiZvcjXi28";

export default function Contact() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      tierInterest: "enterprise",
      estimatedVolume: "",
      message: "",
      source: "contact_form",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/leads", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for reaching out. Our team will contact you within 24 hours.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again or email us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contact Sales - PhotonicTag | EU DPP Compliance</title>
        <meta name="description" content="Get in touch with PhotonicTag. Book a demo, request a consultation, or discuss your EU Digital Product Passport compliance needs. Response within 24 hours." />
        <meta property="og:title" content="Contact PhotonicTag - EU DPP Compliance Experts" />
        <meta property="og:description" content="Talk to our team about EU DPP compliance. Book a demo or request a consultation." />
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
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Request a Consultation</CardTitle>
                <CardDescription>Tell us about your product compliance needs</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Smith" {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@company.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Acme Corp" {...field} data-testid="input-company" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Head of Compliance" {...field} data-testid="input-job-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tierInterest"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plan Interest</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-tier">
                                  <SelectValue placeholder="Select a plan" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="poc">POC (50 products)</SelectItem>
                                <SelectItem value="starter">Starter (€1,499/mo)</SelectItem>
                                <SelectItem value="growth">Growth (€2,999/mo)</SelectItem>
                                <SelectItem value="enterprise">Enterprise (Custom)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estimatedVolume"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Volume</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-volume">
                                  <SelectValue placeholder="Select volume" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="under-1k">Under 1,000</SelectItem>
                                <SelectItem value="1k-10k">1,000 - 10,000</SelectItem>
                                <SelectItem value="10k-100k">10,000 - 100,000</SelectItem>
                                <SelectItem value="100k-1m">100,000 - 1M</SelectItem>
                                <SelectItem value="over-1m">Over 1M</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How can we help? *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your compliance needs, timeline, and any questions you have..." 
                              className="min-h-32"
                              {...field} 
                              data-testid="input-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={submitMutation.isPending}
                      data-testid="button-submit"
                    >
                      {submitMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Book a Demo Call</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      See PhotonicTag in action. Schedule a personalized demo with our team.
                    </p>
                    <Button asChild data-testid="button-book-demo">
                      <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer">
                        Book a Demo
                      </a>
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
                  <p className="text-muted-foreground text-sm mb-2">For general inquiries and support</p>
                  <a href="mailto:hello@photonictag.com" className="text-primary hover:underline" data-testid="link-email-hello">
                    hello@photonictag.com
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Enterprise Sales</h3>
                  <p className="text-muted-foreground text-sm mb-2">For SAP integration and custom solutions</p>
                  <a href="mailto:enterprise@photonictag.com" className="text-primary hover:underline" data-testid="link-email-enterprise">
                    enterprise@photonictag.com
                  </a>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Why Companies Choose Us</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>EU DPP compliant from day one</li>
                <li>SAP S/4HANA integration ready</li>
                <li>AI-powered insights included</li>
                <li>Free tier to get started</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
