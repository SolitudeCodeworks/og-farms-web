import { Shield, AlertTriangle, FileText, CheckCircle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-green-900/30 rounded-full mb-6 border border-green-500/30">
            <FileText className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-gray-400 text-lg">
            Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          
          {/* Section 1: Age Restriction */}
          <section className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">1. Age Restriction</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                By accessing this website, you confirm that you are at least <span className="font-bold text-red-400">18 years of age</span>. 
                Our products are strictly for adult use only. We reserve the right to request proof of age at any time, 
                including during the registration process, checkout, or upon delivery.
              </p>
              <p>
                Providing false information about your age to access our website or purchase products is a violation 
                of our terms and may result in the immediate termination of your account and legal consequences.
              </p>
            </div>
          </section>

          {/* Section 2: General Use */}
          <section className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">2. General Terms of Use</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Welcome to OG Farms. These terms and conditions outline the rules and regulations for the use of our website. 
                By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use 
                OG Farms' website if you do not accept all of the terms and conditions stated on this page.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-400">
                <li>You may not use our products for any illegal or unauthorized purpose.</li>
                <li>You must not transmit any worms or viruses or any code of a destructive nature.</li>
                <li>A breach or violation of any of the Terms will result in an immediate termination of your Services.</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Products and Orders */}
          <section className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">3. Products, Availability, and Pricing</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                All products on our website are subject to availability. We reserve the right to limit the quantities of any products 
                or services that we offer. All descriptions of products or product pricing are subject to change at any time without notice.
              </p>
              <p>
                We have made every effort to display as accurately as possible the colors and images of our products. 
                However, we cannot guarantee that your computer monitor's display of any color will be accurate.
              </p>
              <p>
                We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, 
                geographic region, or jurisdiction. We may exercise this right on a case-by-case basis.
              </p>
            </div>
          </section>

           {/* Section 4: Privacy & Data */}
           <section className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold text-white">4. Privacy and Data Collection</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Your submission of personal information through the store is governed by our Privacy Policy. 
                We are committed to securing your data and keeping it confidential. We will not sell your personal data to third parties.
              </p>
            </div>
          </section>

           {/* Section 5: Governing Law */}
           <section className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold text-white">5. Governing Law</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                These Terms of Service and any separate agreements whereby we provide you Services shall be governed by 
                and construed in accordance with the laws of South Africa.
              </p>
              <p>
                It is the responsibility of the customer to ensure that they are complying with all local laws and regulations 
                regarding the purchase, possession, and use of cannabis products in their specific region within South Africa.
              </p>
            </div>
          </section>

          {/* Contact info underneath */}
          <div className="text-center mt-16 pt-8 border-t border-zinc-800">
            <p className="text-gray-400">
              Questions about the Terms of Service should be sent to us at{" "}
              <a href="mailto:support@ogfarms.co.za" className="text-green-400 hover:text-green-300 underline underline-offset-4 cursor-pointer">
                support@ogfarms.co.za
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
