import { Lock, Eye, Shield, Database, Mail } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-green-900/30 rounded-full mb-6 border border-green-500/30">
            <Lock className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg">
            Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          
          {/* Section 1: Information Collection */}
          <section className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Database className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                When you visit OG Farms, we collect certain information about your device, your interaction with the Site,
                and information necessary to process your purchases. We may also collect additional information if you contact us for customer support.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-400">
                <li><strong className="text-white">Order Information:</strong> name, billing address, shipping address, payment information, email address, and phone number.</li>
                <li><strong className="text-white">Device Information:</strong> version of web browser, IP address, time zone, cookie information, what sites or products you view, and how you interact with the site.</li>
                <li><strong className="text-white">Account Information:</strong> username, password, age verification status, and order history.</li>
              </ul>
            </div>
          </section>

          {/* Section 2: How We Use Your Information */}
          <section className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We use the Order Information that we collect generally to fulfill any orders placed through the Site
                (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).
              </p>
              <p>
                Additionally, we use this Order Information to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-400">
                <li>Communicate with you;</li>
                <li>Screen our orders for potential risk or fraud; and</li>
                <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
                <li>Verify your age to comply with local laws and regulations regarding the sale of age-restricted products.</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Data Security & Retention */}
          <section className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Eye className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">3. Data Security & Retention</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We use reasonable security measures to protect the personal information we collect. However, please be aware that no security measures are perfect or impenetrable. 
                We do not sell, trade, or rent Users' personal identification information to others.
              </p>
              <p>
                When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
              </p>
            </div>
          </section>

          {/* Contact info underneath */}
          <div className="text-center mt-16 pt-8 border-t border-zinc-800">
            <div className="inline-flex items-center justify-center p-3 bg-zinc-800 rounded-full mb-4">
              <Mail className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Have Questions?</h3>
            <p className="text-gray-400">
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at{" "}
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
