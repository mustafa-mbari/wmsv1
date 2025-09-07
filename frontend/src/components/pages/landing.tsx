"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Package, 
  BarChart3, 
  Users, 
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  Star
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/ui/theme-provider";

const features = [
  {
    icon: Package,
    title: "Inventory Management",
    description: "Track products, stock levels, and locations in real-time with our intuitive interface."
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description: "Get insights into your warehouse operations with comprehensive reports and dashboards."
  },
  {
    icon: Users,
    title: "Multi-User Support",
    description: "Role-based access control ensures the right people have access to the right features."
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with data encryption and regular backups."
  },
  {
    icon: Zap,
    title: "Fast Performance",
    description: "Built with modern technology for lightning-fast response times."
  },
  {
    icon: Globe,
    title: "Multi-Warehouse",
    description: "Manage multiple warehouse locations from a single, unified platform."
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Operations Manager",
    company: "TechCorp",
    content: "This WMS has transformed our warehouse operations. Inventory tracking is now effortless and accurate.",
    rating: 5
  },
  {
    name: "Mike Chen",
    role: "Warehouse Director",
    company: "Global Logistics",
    content: "The reporting features are incredible. We can now make data-driven decisions quickly.",
    rating: 5
  },
  {
    name: "Lisa Rodriguez",
    role: "Supply Chain Manager",
    company: "RetailPlus",
    content: "User-friendly interface and powerful features. Our team was up and running in no time.",
    rating: 5
  }
];

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">WMS v1</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              🚀 Version 1.0 Now Available
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Modern Warehouse
              <br />
              <span className="text-primary">Management System</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamline your warehouse operations with our comprehensive WMS solution. 
              Built with React, TypeScript, and modern best practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/auth/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/auth/login">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything you need to manage your warehouse
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive WMS includes all the tools you need to optimize your warehouse operations.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Trusted by warehouse teams worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our customers are saying about WMS v1
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to transform your warehouse?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of companies using WMS v1 to optimize their warehouse operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/auth/register">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-primary">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">WMS v1</span>
            </div>
            <p className="text-muted-foreground">
              © 2024 WMS v1. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}