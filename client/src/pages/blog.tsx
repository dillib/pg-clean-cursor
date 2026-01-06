import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";
import { PublicNav } from "@/components/public-nav";

const blogPosts = [
  {
    title: "Understanding the EU Digital Product Passport Regulation",
    excerpt: "The European Union's Digital Product Passport (DPP) regulation is set to transform how products are tracked and verified. Learn what this means for your business.",
    date: "January 3, 2026",
    category: "Compliance",
    readTime: "8 min read",
  },
  {
    title: "How QR Codes Are Revolutionizing Supply Chain Transparency",
    excerpt: "From factory floor to consumer hands, QR codes are enabling unprecedented visibility into product journeys. Discover how leading brands are using this technology.",
    date: "December 28, 2025",
    category: "Technology",
    readTime: "6 min read",
  },
  {
    title: "The Rise of Sustainable Product Passports",
    excerpt: "Consumers increasingly want to know the environmental impact of their purchases. See how digital passports are making sustainability data accessible.",
    date: "December 20, 2025",
    category: "Sustainability",
    readTime: "5 min read",
  },
  {
    title: "Fighting Counterfeits with Digital Identity",
    excerpt: "Counterfeiting costs brands billions annually. Learn how tamper-proof digital identities are helping companies protect their products and customers.",
    date: "December 15, 2025",
    category: "Security",
    readTime: "7 min read",
  },
  {
    title: "Building Consumer Trust Through Transparency",
    excerpt: "Today's consumers demand authenticity. Explore how brands are using product passports to build deeper connections with their customers.",
    date: "December 10, 2025",
    category: "Business",
    readTime: "4 min read",
  },
  {
    title: "The Future of Circular Economy and Product Traceability",
    excerpt: "As the world moves toward a circular economy, product traceability becomes essential. Understand how digital passports enable recycling and reuse.",
    date: "December 5, 2025",
    category: "Sustainability",
    readTime: "6 min read",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Blog</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-blog-title">
            Insights & Updates
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed about product identity, supply chain transparency, and compliance best practices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <Card key={index} className="hover-elevate cursor-pointer" data-testid={`card-blog-${index}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{post.category}</Badge>
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                </div>
                <h2 className="text-lg font-semibold leading-tight">{post.title}</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button variant="outline" className="gap-2" data-testid="button-load-more">
            Load More Articles
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
