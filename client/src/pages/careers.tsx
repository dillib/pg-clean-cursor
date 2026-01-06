import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Clock, Users, Heart, Zap, Globe } from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";

const openPositions = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote (US/EU)",
    type: "Full-time",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Solutions Architect",
    department: "Customer Success",
    location: "Berlin, Germany",
    type: "Full-time",
  },
  {
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Technical Writer",
    department: "Product",
    location: "Remote",
    type: "Contract",
  },
];

const benefits = [
  { icon: Globe, title: "Remote-First", description: "Work from anywhere in the world" },
  { icon: Heart, title: "Health & Wellness", description: "Comprehensive health insurance" },
  { icon: Zap, title: "Learning Budget", description: "$2,000/year for professional development" },
  { icon: Users, title: "Team Retreats", description: "Annual company gatherings" },
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Careers</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-careers-title">
            Join Our Mission
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help us build the identity layer for physical products. We're looking for passionate people 
            who want to create transparency in global supply chains.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit) => (
            <Card key={benefit.title}>
              <CardContent className="p-6 text-center">
                <benefit.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
          <div className="space-y-4">
            {openPositions.map((position, index) => (
              <Card key={index} className="hover-elevate cursor-pointer" data-testid={`card-position-${index}`}>
                <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-lg">{position.title}</h3>
                    <p className="text-sm text-muted-foreground">{position.department}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {position.location}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {position.type}
                    </div>
                    <Button size="sm" className="gap-1" data-testid={`button-apply-${index}`}>
                      Apply
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-16 p-8 bg-muted/30 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Don't See a Fit?</h2>
          <p className="text-muted-foreground mb-6">
            We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <Button variant="outline" asChild className="gap-2" data-testid="button-send-resume">
            <a href="mailto:careers@photonictag.com">
              Send Your Resume
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
