import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Workflow,
  Shield,
  Brain,
  ArrowRight,
  Check,
  Mail,
  Webhook,
  PhoneIncoming,
  GitBranch,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">Workio</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              How It Works
            </a>
            <a href="#integrations" className="text-sm text-muted-foreground hover:text-foreground">
              Integrations
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-sky-500/10 px-4 py-1.5 text-sm text-sky-600 dark:text-sky-400 mb-6">
              <Brain className="h-4 w-4" />
              AI-Powered Workflow Automation
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Automate your work
              <br />
              <span className="text-sky-500">with intelligent agents</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Build, execute, and monitor automated workflows powered by AI.
              Connect external services, trigger actions, and let intelligent
              agents handle the rest.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-in">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to automate
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From simple triggers to complex AI-driven workflows
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Brain,
              title: "AI Agents",
              description:
                "Intelligent agents that understand context and make decisions. Powered by Vercel AI Gateway with multiple model support.",
            },
            {
              icon: Workflow,
              title: "Visual Builder",
              description:
                "Drag-and-drop workflow builder with real-time preview. Connect nodes, configure parameters, and deploy in minutes.",
            },
            {
              icon: Zap,
              title: "Real-time Execution",
              description:
                "Watch your workflows execute in real-time with live logs, step-by-step progress, and instant notifications.",
            },
            {
              icon: Shield,
              title: "Enterprise Security",
              description:
                "OAuth 2.0 authentication, role-based access control, encrypted API key storage, and audit logging.",
            },
            {
              icon: Mail,
              title: "Email Automation",
              description:
                "Send transactional emails, parse incoming messages, and build email sequences with our Resend integration.",
            },
            {
              icon: Webhook,
              title: "HTTP & Webhooks",
              description:
                "Connect to any external API with our HTTP request node. Support for auth, headers, and custom payloads.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10">
                <feature.icon className="h-6 w-6 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t bg-muted/30 py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three steps to automate any process
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Build",
                description:
                  "Drag nodes onto the canvas and connect them. Configure each step with parameters, conditions, and external service credentials.",
              },
              {
                step: "02",
                title: "Execute",
                description:
                  "Run your workflow manually or trigger it via webhook. AI agents process each step, calling external services as needed.",
              },
              {
                step: "03",
                title: "Monitor",
                description:
                  "Watch real-time execution logs, track success rates, and get notified of failures. Iterate and improve your workflows.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-muted-foreground/20">
                  {item.step}
                </div>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
            Connect your tools
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Integrate with the services you already use
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Email (Resend)", icon: Mail },
            { name: "Slack", icon: Webhook },
            { name: "Discord", icon: PhoneIncoming },
            { name: "Custom APIs", icon: GitBranch },
          ].map((integration) => (
            <div
              key={integration.name}
              className="flex items-center gap-3 rounded-lg border bg-card p-4"
            >
              <div className="rounded-lg bg-sky-500/10 p-2">
                <integration.icon className="h-5 w-5 text-sky-500" />
              </div>
              <span className="font-medium">{integration.name}</span>
              <Check className="ml-auto h-4 w-4 text-green-500" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to automate your workflow?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Start building AI-powered workflows today. No credit card required.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Workio</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Workio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
