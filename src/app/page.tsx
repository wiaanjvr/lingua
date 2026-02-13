import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Headphones,
  Mic,
  Brain,
  TrendingUp,
  ChevronRight,
  Award,
  Target,
  Users,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="scroll-snap-container bg-background">
      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-luxury border-b border-luxury-cognac/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-cognac rounded-xl flex items-center justify-center shadow-luxury transition-luxury group-hover:shadow-luxury-lg group-hover:scale-105">
                <span className="text-white font-serif font-bold text-xl">
                  L
                </span>
              </div>
              <span className="text-xl font-light tracking-tight">Lingua</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-light hover:text-luxury-cognac transition-luxury"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="bg-gradient-cognac text-white hover:shadow-lg hover:shadow-luxury-cognac/20 font-light transition-luxury hover:scale-105"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Section 1: Hero */}
      <section className="scroll-snap-section relative flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-cognac/2 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-luxury-bronze/2 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-luxury-cognac/2 via-background to-background -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-luxury-cognac/15 bg-gradient-ambient-warm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-luxury-cognac" />
            <span className="text-sm font-light tracking-wide text-foreground/90">
              Premium Language Acquisition
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.05]">
            Learn a language the way
            <br />
            <span className="font-serif italic text-gradient-cognac">
              it's actually acquired.
            </span>
          </h1>

          <p className="text-2xl md:text-3xl text-foreground/70 font-light max-w-2xl mx-auto leading-relaxed">
            Listen. Try. Improve. Repeat.
          </p>

          <div className="inline-block max-w-xl">
            <div className="card-cognac p-6 relative overflow-hidden leather-texture">
              <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-cognac/2 rounded-full blur-2xl" />
              <p className="text-base font-light text-foreground/90 relative">
                Meet your monthly learning goals and
                <br />
                <span className="text-lg font-medium text-luxury-cognac">
                  earn back 50% of your subscription.
                </span>
              </p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground font-light">
            No hype. Just disciplined progress.
          </p>

          <div className="pt-4">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-cognac text-white hover:shadow-2xl hover:shadow-luxury-cognac/25 px-12 h-16 text-lg font-light rounded-2xl transition-luxury hover:scale-105 group"
              >
                Start Learning
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Philosophy */}
      <section className="scroll-snap-section relative flex items-center justify-center px-6 overflow-hidden bg-gradient-ambient-warm">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-4xl md:text-5xl font-light leading-relaxed">
            Most language apps focus on recognition.
            <br />
            <span className="font-serif italic text-luxury-cognac">
              This one focuses on understanding and speaking.
            </span>
          </h2>

          <p className="text-xl font-light text-foreground/90">
            Each lesson is built around:
          </p>

          <div className="grid md:grid-cols-3 gap-6 pt-6">
            <div className="card-cognac p-8 text-center hover-cognac group leather-texture">
              <div className="w-14 h-14 rounded-xl bg-luxury-cognac/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-luxury-cognac/12 transition-luxury">
                <div className="w-3 h-3 rounded-full bg-luxury-cognac" />
              </div>
              <p className="text-base font-light text-foreground/80">
                <span className="font-medium text-foreground block mb-2">
                  95% familiar language
                </span>
                so you can follow
              </p>
            </div>
            <div className="card-cognac p-8 text-center hover-cognac group leather-texture">
              <div className="w-14 h-14 rounded-xl bg-luxury-cognac/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-luxury-cognac/12 transition-luxury">
                <div className="w-3 h-3 rounded-full bg-luxury-cognac" />
              </div>
              <p className="text-base font-light text-foreground/80">
                <span className="font-medium text-foreground block mb-2">
                  New words to learn
                </span>
                so you grow
              </p>
            </div>
            <div className="card-cognac p-8 text-center hover-cognac group leather-texture">
              <div className="w-14 h-14 rounded-xl bg-luxury-cognac/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-luxury-cognac/12 transition-luxury">
                <div className="w-3 h-3 rounded-full bg-luxury-cognac" />
              </div>
              <p className="text-base font-light text-foreground/80">
                <span className="font-medium text-foreground block mb-2">
                  Immediate speaking
                </span>
                so you build confidence
              </p>
            </div>
          </div>

          <div className="pt-10 max-w-2xl mx-auto">
            <div className="border-l-2 border-luxury-cognac/25 pl-8 space-y-4 text-left">
              <p className="text-base font-light text-muted-foreground italic">
                You won't understand everything at first. That's normal.
              </p>
              <p className="text-lg font-light text-foreground">
                You will understand more the second time.{" "}
                <span className="font-medium text-luxury-cognac">
                  That's progress.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section className="scroll-snap-section relative flex items-center justify-center px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
              The goal is not perfection.
              <br />
              The goal is{" "}
              <span className="text-luxury-cognac font-medium">
                steady, measurable improvement.
              </span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-cognac p-10 group hover-cognac relative overflow-hidden leather-texture">
              <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-cognac/3 rounded-full blur-2xl" />
              <div className="flex items-start gap-6 relative">
                <div className="w-16 h-16 rounded-2xl bg-luxury-cognac/8 flex items-center justify-center flex-shrink-0 group-hover:bg-luxury-cognac/12 group-hover:scale-110 transition-luxury">
                  <Headphones className="h-8 w-8 text-luxury-cognac" />
                </div>
                <div>
                  <h3 className="text-2xl font-light mb-3 text-foreground">
                    Listen first
                  </h3>
                  <p className="text-base text-muted-foreground font-light leading-relaxed">
                    You hear the story before seeing the text.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-cognac p-10 group hover-cognac relative overflow-hidden leather-texture">
              <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-cognac/3 rounded-full blur-2xl" />
              <div className="flex items-start gap-6 relative">
                <div className="w-16 h-16 rounded-2xl bg-luxury-cognac/8 flex items-center justify-center flex-shrink-0 group-hover:bg-luxury-cognac/12 group-hover:scale-110 transition-luxury">
                  <Mic className="h-8 w-8 text-luxury-cognac" />
                </div>
                <div>
                  <h3 className="text-2xl font-light mb-3 text-foreground">
                    Speak from understanding
                  </h3>
                  <p className="text-base text-muted-foreground font-light leading-relaxed">
                    Even if it's imperfect. Especially if it's imperfect.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-cognac p-10 group hover-cognac relative overflow-hidden leather-texture">
              <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-cognac/3 rounded-full blur-2xl" />
              <div className="flex items-start gap-6 relative">
                <div className="w-16 h-16 rounded-2xl bg-luxury-cognac/8 flex items-center justify-center flex-shrink-0 group-hover:bg-luxury-cognac/12 group-hover:scale-110 transition-luxury">
                  <Brain className="h-8 w-8 text-luxury-cognac" />
                </div>
                <div>
                  <h3 className="text-2xl font-light mb-3 text-foreground">
                    Review intelligently
                  </h3>
                  <p className="text-base text-muted-foreground font-light leading-relaxed">
                    We highlight new words and reinforce what you've learned.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-cognac p-10 group hover-cognac relative overflow-hidden leather-texture">
              <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-cognac/3 rounded-full blur-2xl" />
              <div className="flex items-start gap-6 relative">
                <div className="w-16 h-16 rounded-2xl bg-luxury-cognac/8 flex items-center justify-center flex-shrink-0 group-hover:bg-luxury-cognac/12 group-hover:scale-110 transition-luxury">
                  <TrendingUp className="h-8 w-8 text-luxury-cognac" />
                </div>
                <div>
                  <h3 className="text-2xl font-light mb-3 text-foreground">
                    Speak again
                  </h3>
                  <p className="text-base text-muted-foreground font-light leading-relaxed">
                    You'll hear the difference yourself.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Why It Works */}
      <section className="scroll-snap-section relative flex items-center justify-center px-6 overflow-hidden bg-gradient-ambient-warm">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-luxury-cognac/3 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto relative">
          <h2 className="text-5xl md:text-6xl font-light text-center mb-12 tracking-tight">
            Why It Works
          </h2>

          <div className="space-y-6">
            <div className="card-cognac p-8 hover-cognac leather-texture">
              <p className="text-xl font-light leading-relaxed text-foreground/90">
                Language isn't memorized.{" "}
                <span className="font-medium text-luxury-cognac">
                  It's absorbed through repeated exposure and use.
                </span>
              </p>
            </div>

            <div className="card-cognac p-8 hover-cognac leather-texture">
              <p className="text-xl font-light leading-relaxed text-foreground/80">
                Lessons are structured so that most of what you hear is already
                familiar, with a small stretch beyond your comfort zone.
              </p>
            </div>

            <div className="card-cognac p-8 hover-cognac leather-texture">
              <p className="text-xl font-light leading-relaxed text-foreground/80">
                We recycle vocabulary at the right intervals so you don't forget
                what you worked hard to learn.
              </p>
            </div>

            <div className="card-cognac p-8 hover-cognac leather-texture border-luxury-cognac/15">
              <p className="text-xl font-medium leading-relaxed text-foreground flex items-center gap-3">
                <Zap className="h-6 w-6 text-luxury-cognac flex-shrink-0" />
                You don't just consume content. You engage with it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Accountability */}
      <section className="scroll-snap-section relative flex items-center justify-center px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-light text-center mb-12 tracking-tight">
            The Accountability Model
          </h2>

          <div className="card-cognac p-12 text-center space-y-8 relative overflow-hidden leather-texture">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-luxury-cognac/3 rounded-full blur-3xl" />

            <div className="w-20 h-20 mx-auto rounded-2xl bg-luxury-cognac/8 flex items-center justify-center relative">
              <Target className="h-10 w-10 text-luxury-cognac" />
            </div>

            <div className="space-y-5 text-xl font-light relative">
              <p className="text-foreground/90">
                Set a monthly learning target.
              </p>
              <p className="text-foreground">
                If you complete your lessons and meet your speaking goals:
              </p>
              <p className="text-2xl md:text-3xl font-medium text-luxury-cognac">
                You earn back 50% of what you paid.
              </p>
            </div>

            <div className="pt-8 border-t border-luxury-cognac/15 space-y-4 relative">
              <p className="text-lg text-foreground/80 font-light">
                We're aligned with your effort.
              </p>
              <p className="text-xl text-foreground font-medium">
                If you show up and do the work, you get rewarded.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Who It's For */}
      <section className="scroll-snap-section relative flex items-center justify-center px-6 overflow-hidden bg-gradient-ambient-warm">
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-luxury-bronze/3 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto relative">
          <h2 className="text-5xl md:text-6xl font-light text-center mb-12 tracking-tight">
            Who It's For
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-cognac p-10 hover-cognac group leather-texture">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-luxury-cognac/8 flex items-center justify-center group-hover:bg-luxury-cognac/12 group-hover:scale-110 transition-luxury">
                  <Users className="h-7 w-7 text-luxury-cognac" />
                </div>
                <p className="text-xl font-light text-foreground">
                  Self-driven learners
                </p>
              </div>
            </div>
            <div className="card-cognac p-10 hover-cognac group leather-texture">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-luxury-cognac/8 flex items-center justify-center group-hover:bg-luxury-cognac/12 group-hover:scale-110 transition-luxury">
                  <Award className="h-7 w-7 text-luxury-cognac" />
                </div>
                <p className="text-xl font-light text-foreground">
                  Professionals who value structure
                </p>
              </div>
            </div>
            <div className="card-cognac p-10 hover-cognac group leather-texture">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-luxury-cognac/8 flex items-center justify-center group-hover:bg-luxury-cognac/12 group-hover:scale-110 transition-luxury">
                  <Mic className="h-7 w-7 text-luxury-cognac" />
                </div>
                <p className="text-xl font-light text-foreground">
                  Students preparing for conversations
                </p>
              </div>
            </div>
            <div className="card-cognac p-10 hover-cognac group leather-texture">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-luxury-cognac/8 flex items-center justify-center group-hover:bg-luxury-cognac/12 group-hover:scale-110 transition-luxury">
                  <TrendingUp className="h-7 w-7 text-luxury-cognac" />
                </div>
                <p className="text-xl font-light text-foreground">
                  Those who prefer progress over gimmicks
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Final CTA */}
      <section className="scroll-snap-section relative flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-luxury-cognac/3 to-background -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-luxury-cognac/5 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center space-y-12 relative">
          <div className="space-y-8">
            <p className="text-3xl md:text-4xl font-light text-foreground/90 leading-relaxed">
              If you're ready to put in consistent effort —
            </p>
            <p className="text-4xl md:text-5xl font-light text-foreground leading-relaxed">
              we'll make sure that effort{" "}
              <span className="font-serif italic text-gradient-cognac">
                compounds.
              </span>
            </p>
          </div>

          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-gradient-cognac text-white hover:shadow-2xl hover:shadow-luxury-cognac/40 px-16 h-20 text-2xl font-light rounded-2xl transition-luxury hover:scale-105 group"
            >
              Start your first lesson
              <ChevronRight className="ml-3 h-7 w-7 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground font-light pt-4">
            No credit card required • Start learning in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer (not a snap section) */}
      <footer className="border-t border-luxury-cognac/10 py-16 px-6 bg-gradient-to-b from-background to-muted/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-cognac rounded-lg flex items-center justify-center shadow-luxury">
                <span className="text-white font-serif font-bold text-base">
                  L
                </span>
              </div>
              <span className="text-lg font-light tracking-tight">Lingua</span>
            </div>
            <p className="text-sm text-muted-foreground font-light">
              © 2026 Lingua. Disciplined progress, every day.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
