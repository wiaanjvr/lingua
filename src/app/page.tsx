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
                Spaced Repetition + Comprehensible Input
              </span>
            </div>

            {/* Main headline - large, minimal, elegant */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.1]">
              Master Any Language
              <br />
              <span className="font-serif italic">Through the Struggle</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              Embrace the discomfort of listening and speaking. Build real
              fluency through comprehensible input, spaced repetition, and
              forced output.
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
              <h3 className="text-lg font-light mb-3">Comprehensible Input</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Every lesson is ~95% words you know, ~5% new. Push your
                comprehension without overwhelm.
              </p>
            </div>

            <div className="card-interactive p-8 group">
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-luxury">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-light mb-3">Spaced Repetition</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Vocabulary appears at scientifically optimal intervals. Words
                due for review are woven into fresh content.
              </p>
            </div>

            <div className="card-interactive p-8 group">
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-luxury">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-light mb-3">Forced Output</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Speak before you see the text. Get comfortable with the
                struggle—that's where fluency is built.
              </p>
            </div>

            <div className="card-interactive p-8 group">
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-luxury">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-light mb-3">Any Language</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                The same proven method works across languages. Your brain learns
                naturally through struggle and repetition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Elegant Timeline */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-16 tracking-tight">
            A Lesson in <span className="font-serif italic">Six Phases</span>
          </h2>

          <div className="space-y-12">
            {[
              {
                number: "01",
                title: "Audio-Only Comprehension",
                description:
                  "Listen multiple times without seeing text. Embrace the struggle—your brain is working.",
              },
              {
                number: "02",
                title: "Verbal Check",
                description:
                  "Describe what you understood. Speak before reading. This forces active comprehension.",
              },
              {
                number: "03",
                title: "Guided Conversation",
                description:
                  "Get feedback on your understanding through dialogue. Request vocabulary hints when needed.",
              },
              {
                number: "04",
                title: "Text Reveal & Rating",
                description:
                  "See the text. Rate each word's familiarity. This feeds your personalized spaced repetition.",
              },
              {
                number: "05",
                title: "Interactive Exercises",
                description:
                  "Reinforce comprehension with targeted practice. Fill gaps in understanding.",
              },
              {
                number: "06",
                title: "Final Assessment",
                description:
                  "Summarize the lesson verbally. Prove your comprehension. Track your growth.",
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
              Simple Pricing
            </h2>
            <p className="text-muted-foreground font-light">
              One method. Any language. Real fluency.
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
                    One daily lesson (15-30 minutes)
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                  </div>
                  <span className="text-sm font-light">
                    Full 6-phase lesson flow
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                  </div>
                  <span className="text-sm font-light">
                    Spaced repetition vocabulary tracking
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                  </div>
                  <span className="text-sm font-light">
                    Speaking practice with recording
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
                  <span className="text-sm font-light">
                    Unlimited daily lessons
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-background" />
                  </div>
                  <span className="text-sm font-light">Multiple languages</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-background" />
                  </div>
                  <span className="text-sm font-light">
                    Advanced comprehension analytics
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-background" />
                  </div>
                  <span className="text-sm font-light">
                    AI-powered conversation feedback
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
            © 2026 Lingua. Fluency through struggle.
          </p>
        </div>
      </footer>
    </div>
  );
}
