import { Button } from "@/components/ui/button"; // Standard shadcn placeholder
import { ArrowRight, Gift, Heart, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Section */}
      <header className="py-6 px-4 border-b border-[rgb(95,111,82)] bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎈</span>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary-foreground">
              PartyVerse
            </h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Occasions</a>
            <a href="#" className="hover:text-primary transition-colors">Relationships</a>
            <a href="#" className="hover:text-primary transition-colors">Track Order</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium hover:text-primary">Login</button>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
              Cart (0)
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-secondary/30 to-background">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-xs font-medium">
              <Heart size={12} className="fill-current" />
              <span>Make someone feel special today</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              Delight driven <span className="text-primary italic">unboxing</span>.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              More than just a gift. Create a memory with our occasion-curated collections and emotional personalization.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <button className="bg-foreground text-background px-8 py-3 rounded-full font-medium hover:bg-foreground/90 transition-all flex items-center gap-2">
                Find a Gift <ArrowRight size={16} />
              </button>
              <button className="bg-white border border-input px-8 py-3 rounded-full font-medium hover:bg-muted transition-all text-foreground">
                View Collections
              </button>
            </div>
          </div>
        </section>

        {/* Occasions Grid (Placeholder) */}
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <h3 className="text-2xl font-semibold mb-8">Shop by Occasion</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Birthday', 'Anniversary', 'Valentine\'s', 'Just Because'].map((occasion, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-muted hover:shadow-xl transition-all cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <div className="absolute bottom-4 left-4 z-20 text-white">
                  <h4 className="font-bold text-lg">{occasion}</h4>
                  <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                    Explore <ArrowRight size={10} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        © 2025 PartyVerse. Crafted with ❤️.
      </footer>
    </div>
  );
}
