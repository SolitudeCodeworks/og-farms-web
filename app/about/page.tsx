import Image from "next/image"
import { Leaf, Users, Award, Heart, Scale, Sprout } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-black z-10" />
        <Image
          src="/images/about us hero.avif"
          alt="OG Farms Cannabis Field"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            About OG Farms
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light">
            Where passion, culture, and top-tier cannabis join forces.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
          <p className="text-2xl md:text-3xl leading-relaxed text-gray-300 mb-8">
            What started as a small grow with big dreams has grown into a{" "}
            <span className="text-green-400 font-semibold">proudly South African brand</span>{" "}
            built on quality, community, and consistency.
          </p>
          <p className="text-xl text-gray-400 mb-4">
            We're not trying to follow trends.
          </p>
          <p className="text-2xl font-bold text-green-400">
            We're building our own lane.
          </p>
          <div className="mt-12 h-1 w-32 bg-gradient-to-r from-green-400 to-emerald-600 mx-auto rounded-full" />
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 px-4 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center" data-aos="fade-up">
            <div className="relative h-[400px] rounded-2xl overflow-hidden bg-zinc-800">
              <Image
                src="/images/about us image.avif"
                alt="Cannabis Growing"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6 text-green-400">Our Mission</h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                Since day one, the mission has been simple:{" "}
                <span className="text-white font-semibold">
                  grow clean, craft premium, and deliver cannabis products people can trust
                </span>{" "}
                – from seed to sale.
              </p>
              <div className="flex items-center gap-3 text-gray-400">
                <Sprout className="w-6 h-6 text-green-400" />
                <span>Seed to Sale Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
            Our <span className="text-green-400">Story</span>
          </h2>
          <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
            <p>
              Born in the <span className="text-green-400 font-semibold">Vaal</span> and raised through grit, hustle and a love for the plant, 
              OG Farms was founded to bring real quality to the local scene.
            </p>
            <p>
              Everything we produce – from clones and seedlings to flowers and infused products – is managed with care in{" "}
              <span className="text-white font-semibold">controlled environments, greenhouses, and outdoor grows</span>.
            </p>
            <p>
              Whether you're here for wellness, relaxation, creativity or just to enjoy good vibes, 
              OG Farms brings you strains and products designed for{" "}
              <span className="text-green-400 font-semibold">real results and a smooth, enjoyable experience</span> every time.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Cards */}
      <section className="py-20 px-4 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Our <span className="text-green-400">Philosophy</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12">
            Cannabis is more than a plant – it's a lifestyle.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up" data-aos-delay="100">
            {/* Community First */}
            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-6 hover:border-green-400/50 transition-all">
              <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-green-400">Community First</h3>
              <p className="text-gray-400">
                Real people, real stories, real support.
              </p>
            </div>

            {/* Quality */}
            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-6 hover:border-green-400/50 transition-all">
              <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-green-400">Quality Without Compromise</h3>
              <p className="text-gray-400">
                Clean grows, trusted processes, consistent products.
              </p>
            </div>

            {/* Education */}
            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-6 hover:border-green-400/50 transition-all">
              <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-green-400">Education & Empowerment</h3>
              <p className="text-gray-400">
                Helping South Africans understand, grow, and enjoy cannabis responsibly.
              </p>
            </div>

            {/* Inclusivity */}
            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-6 hover:border-green-400/50 transition-all">
              <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-green-400">Inclusivity</h3>
              <p className="text-gray-400">
                The cannabis world is for everyone, not just a select few.
              </p>
            </div>
          </div>

          <p className="text-center text-gray-300 mt-12 text-lg">
            We listen to our customers, adapt to what the market needs, and continuously develop new products 
            inspired by <span className="text-green-400 font-semibold">local flavour and global standards</span>.
          </p>
        </div>
      </section>

      {/* Quality Commitment */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center" data-aos="fade-up">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Our Commitment to <span className="text-green-400">Quality</span>
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Every product that carries the OG Farms name has been grown, cured, or crafted with strict quality control.
              </p>
              <p className="text-gray-300 mb-8">
                We work with trusted cultivators and suppliers, blending local expertise with international best practice.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold text-white">Consistency</h4>
                    <p className="text-gray-400 text-sm">Same great quality, every time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold text-white">Safety</h4>
                    <p className="text-gray-400 text-sm">Rigorous testing and handling</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold text-white">Potency</h4>
                    <p className="text-gray-400 text-sm">Reliable, effective results</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold text-white">Clean Results</h4>
                    <p className="text-gray-400 text-sm">Pure, trusted products</p>
                  </div>
                </div>
              </div>

              <p className="text-green-400 font-semibold mt-8 text-lg">
                Our goal: to deliver cannabis products that you can enjoy with confidence, every time.
              </p>
            </div>
            
            <div className="relative h-[500px] rounded-2xl overflow-hidden bg-zinc-800">
              <Image
                src="/images/qualityControl.webp"
                alt="Quality Control"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fair Cannabis Future */}
      <section className="py-20 px-4 bg-gradient-to-b from-zinc-900/50 to-black">
        <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
          <Scale className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Building a Fair <span className="text-green-400">Cannabis Future</span>
          </h2>
          <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
            <p>
              OG Farms stands behind the movement for a{" "}
              <span className="text-white font-semibold">legal, fair, and accessible cannabis industry</span> in South Africa.
            </p>
            <p>
              We support reform, responsible use, and equal opportunity for all growers and entrepreneurs – big or small.
            </p>
            <p>
              As cannabis laws evolve, we remain active in the conversation, pushing for{" "}
              <span className="text-green-400 font-semibold">clearer, safer, and more inclusive regulations</span>{" "}
              that uplift our communities and support the economy.
            </p>
          </div>
          
          <div className="mt-12 space-y-3">
            <p className="text-2xl font-bold text-white">We're here for the culture.</p>
            <p className="text-2xl font-bold text-white">We're here for the future.</p>
            <p className="text-2xl font-bold text-green-400">We're here for South Africa.</p>
          </div>
        </div>
      </section>

      {/* The OG Farms Promise */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto" data-aos="zoom-in">
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-400/30 rounded-3xl p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              The <span className="text-green-400">OG Farms Promise</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              We honour the plant, we honour the people, and we honour the craft.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              When you choose OG Farms, you're choosing:
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-400">Authentic</div>
                <div className="h-1 w-16 bg-green-400 mx-auto rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-400">Local</div>
                <div className="h-1 w-16 bg-green-400 mx-auto rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-400">Quality</div>
                <div className="h-1 w-16 bg-green-400 mx-auto rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-400">Fresh</div>
                <div className="h-1 w-16 bg-green-400 mx-auto rounded-full" />
              </div>
            </div>

            <p className="text-2xl font-bold text-white">
              Always fresh, always original.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-zinc-900/50">
        <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience <span className="text-green-400">OG Farms</span>?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Explore our premium selection of cannabis products, all grown and crafted with care.
          </p>
          <a
            href="/products"
            className="inline-block bg-green-400 hover:bg-green-500 text-black font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105"
          >
            Shop Our Products
          </a>
        </div>
      </section>
    </div>
  )
}
