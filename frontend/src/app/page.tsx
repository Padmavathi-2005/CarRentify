import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed w-full z-50 premium-glass px-8 py-4 flex justify-between items-center top-0">
  <h1 className="text-2xl font-bold gold-gradient tracking-tighter italic">CarRentify</h1>
  <div className="flex gap-8 text-sm font-medium uppercase tracking-widest text-white/70">
          <a href="#" className="hover:text-white transition-colors">Fleet</a>
          <a href="#" className="hover:text-white transition-colors">Experience</a>
          <a href="#" className="hover:text-white transition-colors">Concierge</a>
          <a href="#" className="px-6 py-2 gold-btn text-black font-bold rounded-sm">Rent Now</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black z-10" />
        <Image
          src="/hero-car.png"
          alt="Luxury Car"
          fill
          className="object-cover animate-fade-in opacity-80"
          priority
        />
        <div className="relative z-20 text-center space-y-6 max-w-4xl px-4">
          <h2 className="text-sm uppercase tracking-[0.4em] text-white/50 animate-fade-in">Redefining the Drive</h2>
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight animate-fade-in [animation-delay:200ms]">
            Experience Pure <span className="gold-gradient">Elegance</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto animate-fade-in [animation-delay:400ms]">
            Access an exclusive collection of the world's finest automobiles.
            Bespoke service for those who demand excellence.
          </p>
          <div className="flex justify-center gap-4 animate-fade-in [animation-delay:600ms]">
            <button className="gold-btn px-10 py-4 rounded-full text-black font-black uppercase text-xs tracking-widest">
              View Collection
            </button>
          </div>
        </div>
      </header>

      {/* Featured Section */}
      <section className="bg-black py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <h3 className="text-sm gold-gradient uppercase tracking-widest font-bold">Featured Models</h3>
              <h2 className="text-4xl font-bold text-white">Our Signature Selection</h2>
            </div>
            <a href="#" className="text-white/40 hover:text-white underline underline-offset-8 transition-all">Explore all models</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Card 1 */}
            <div className="group space-y-6">
              <div className="relative h-[400px] rounded-xl overflow-hidden premium-glass">
                <Image
                  src="/hero-car.png"
                  alt="Sports Car"
                  fill
                  className="object-contain p-8 group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-2xl font-bold text-white">Velocita GT-X</h4>
                  <p className="text-white/40">Performance Electric</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold gold-gradient">$599</span>
                  <p className="text-white/20 text-sm">/ Per Day</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group space-y-6">
              <div className="relative h-[400px] rounded-xl overflow-hidden premium-glass">
                <Image
                  src="/suv-car.png"
                  alt="SUV"
                  fill
                  className="object-contain p-8 group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-2xl font-bold text-white">Lumina All-Terrain</h4>
                  <p className="text-white/40">Luxury Expedition</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold gold-gradient">$450</span>
                  <p className="text-white/20 text-sm">/ Per Day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12 text-center text-white/30 text-xs uppercase tracking-widest">
        © 2026 Prestige Car Rental. All rights reserved.
      </footer>
    </main>
  );
}
