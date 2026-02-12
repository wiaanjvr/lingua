import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Headphones,
  Mic,
  Brain,
  TrendingUp,
  ChevronRight,
  Award,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Luxury Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-serif font-bold text-lg">
                  L
                </span>
              </div>
              <span className="text-xl font-light tracking-tight">Lingua</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="font-light">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="bg-foreground text-background hover:bg-foreground/90 font-light"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Ferrari/Apple Inspired */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Minimalist badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-muted/30 backdrop-blur-sm">
              <Award className="h-3.5 w-3.5" />
              <span className="text-xs font-light tracking-wide">
                Premium Language Mastery
              </span>
            </div>

            {/* Main headline - large, minimal, elegant */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.1]">
              Master French
              <br />
              <span className="font-serif italic">Through Listening</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              An intellectual approach to language acquisition. Immersive audio,
              meaningful practice, and the timeless art of comprehension.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-foreground text-background hover:bg-foreground/90 px-8 h-12 text-base font-light rounded-xl"
                >
                  Begin Your Journey
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Minimalist Cards */}
      <section className="py-24 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-interactive p-8 group">
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-luxury">
                <Headphones className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-light mb-3">Listening-First</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Prioritize comprehensible audio input. Your mind acquires
                language through immersion, not translation.
              </p>
            </div>

            <div className="card-interactive p-8 group">
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-luxury">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-light mb-3">Interest-Driven</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Philosophy, science, history—explore content that engages your
                intellect, not generic lessons.
              </p>
            </div>

            <div className="card-interactive p-8 group">
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-luxury">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-light mb-3">Refined Speaking</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Express ideas meaningfully. Receive precise feedback on
                pronunciation and fluency.
              </p>
            </div>

            <div className="card-interactive p-8 group">
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-luxury">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-light mb-3">Natural Progress</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Patterns emerge organically in new contexts. No flashcard
                anxiety—gradual mastery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Elegant Timeline */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-16 tracking-tight">
            A Session in{" "}
            <span className="font-serif italic">Four Movements</span>
          </h2>

          <div className="space-y-12">
            {[
              {
                number: "01",
                title: "Immersive Listening",
                description:
                  "60-90 seconds of carefully curated audio. Full immersion, then optional vocabulary support for clarity.",
              },
              {
                number: "02",
                title: "Active Recognition",
                description:
                  "Thoughtful comprehension questions. Pattern isolation. Sound differentiation—building understanding, not guessing.",
              },
              {
                number: "03",
                title: "Guided Expression",
                description:
                  "Articulate what you've absorbed. Receive specific pronunciation feedback. Track your evolution.",
              },
              {
                number: "04",
                title: "Progress Reflection",
                description:
                  "Review patterns mastered. Preview tomorrow's journey. Cultivate anticipation, not obligation.",
              },
            ].map((step, index) => (
              <div key={index} className="flex gap-8 group">
                <div className="flex-shrink-0">
                  <div className="text-5xl font-light text-muted-foreground/30 group-hover:text-foreground/50 transition-luxury">
                    {step.number}
                  </div>
                </div>
                <div className="pt-2 border-l border-border/30 pl-8 group-hover:border-foreground/20 transition-luxury">
                  <h3 className="text-xl font-light mb-2">{step.title}</h3>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Luxury Minimalist */}
      <section className="py-24 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-tight">
              Thoughtful Pricing
            </h2>
            <p className="text-muted-foreground font-light">
              Transparent. Ethical. Premium value.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="card-luxury p-8 bg-card">
              <div className="mb-8">
                <h3 className="text-2xl font-light mb-2">Free</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-light">$0</span>
                  <span className="text-muted-foreground font-light text-sm">
                    /month
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                  </div>
                  <span className="text-sm font-light">
                    One daily session (15-30 minutes)
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                  </div>
                  <span className="text-sm font-light">
                    Core learning content
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                  </div>
                  <span className="text-sm font-light">
                    Basic progress tracking
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                  </div>
                  <span className="text-sm font-light">
                    Speaking practice (recording)
                  </span>
                </div>
              </div>

              <Link href="/auth/signup" className="block">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl font-light"
                >
                  Start Free
                </Button>
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="card-luxury p-8 bg-foreground text-background relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1 rounded-full bg-background/10 backdrop-blur-sm border border-background/20">
                  <span className="text-xs font-light">Recommended</span>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-light mb-2">Premium</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-light">$12</span>
                  <span className="text-background/70 font-light text-sm">
                    /month
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-background" />
                  </div>
                  <span className="text-sm font-light">Unlimited sessions</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-background" />
                  </div>
                  <span className="text-sm font-light">All content topics</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-background" />
                  </div>
                  <span className="text-sm font-light">
                    Advanced progress analytics
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-background" />
                  </div>
                  <span className="text-sm font-light">
                    Pronunciation analysis & feedback
                  </span>
                </div>
              </div>

              <Link href="/auth/signup" className="block">
                <Button className="w-full h-11 rounded-xl bg-background text-foreground hover:bg-background/90 font-light">
                  Start Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground font-light">
            © 2026 Lingua. Crafted for the discerning learner.
          </p>
        </div>
      </footer>
    </div>
  );
}
