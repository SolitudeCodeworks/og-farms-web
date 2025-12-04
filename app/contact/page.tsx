import { prisma } from "@/lib/prisma"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export const metadata = {
  title: "Contact Us - OG Farms",
  description: "Find our store locations and contact information",
}

async function getActiveStores() {
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
  return stores
}

export default async function ContactPage() {
  const stores = await getActiveStores()

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Video */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
        >
          <source src="/weed_loop.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Visit one of our store locations or get in touch with us
          </p>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-primary/50 transition-all"
            >
              {/* Store Name */}
              <h2 className="text-2xl font-bold text-white mb-4">
                {store.name}
              </h2>

              {/* Address */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div className="text-gray-300">
                    <p>{store.address}</p>
                    <p>{store.city}, {store.state} {store.zipCode}</p>
                    <p>{store.country}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-3 items-start">
                  <Phone className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <a 
                    href={`tel:${store.phone}`}
                    className="text-gray-300 hover:text-primary transition-colors"
                  >
                    {store.phone}
                  </a>
                </div>

                {/* Email */}
                {store.email && (
                  <div className="flex gap-3 items-start">
                    <Mail className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <a 
                      href={`mailto:${store.email}`}
                      className="text-gray-300 hover:text-primary transition-colors break-all"
                    >
                      {store.email}
                    </a>
                  </div>
                )}

                {/* Opening Hours */}
                {store.openingHours && typeof store.openingHours === 'object' && Object.values(store.openingHours).some(h => h) && (() => {
                  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                  const hours = store.openingHours as Record<string, string>
                  const grouped: { days: string; hours: string }[] = []
                  
                  let currentGroup: string[] = []
                  let currentHours = ''
                  
                  daysOrder.forEach((day, index) => {
                    const dayHours = hours[day]?.trim() || ''
                    
                    if (!dayHours) {
                      if (currentGroup.length > 0) {
                        grouped.push({ 
                          days: currentGroup.length === 1 
                            ? currentGroup[0] 
                            : `${currentGroup[0]} - ${currentGroup[currentGroup.length - 1]}`,
                          hours: currentHours 
                        })
                        currentGroup = []
                        currentHours = ''
                      }
                      return
                    }
                    
                    if (dayHours === currentHours) {
                      currentGroup.push(day)
                    } else {
                      if (currentGroup.length > 0) {
                        grouped.push({ 
                          days: currentGroup.length === 1 
                            ? currentGroup[0] 
                            : `${currentGroup[0]} - ${currentGroup[currentGroup.length - 1]}`,
                          hours: currentHours 
                        })
                      }
                      currentGroup = [day]
                      currentHours = dayHours
                    }
                    
                    if (index === daysOrder.length - 1 && currentGroup.length > 0) {
                      grouped.push({ 
                        days: currentGroup.length === 1 
                          ? currentGroup[0] 
                          : `${currentGroup[0]} - ${currentGroup[currentGroup.length - 1]}`,
                        hours: currentHours 
                      })
                    }
                  })
                  
                  return (
                    <div className="flex gap-3 items-start">
                      <Clock className="w-5 h-5 text-primary shrink-0 mt-1" />
                      <div className="text-gray-300">
                        <p className="font-semibold mb-2">Opening Hours:</p>
                        <div className="text-sm space-y-1">
                          {grouped.map((group, index) => (
                            <div key={index} className="flex justify-between gap-4">
                              <span className="capitalize">{group.days}:</span>
                              <span className="text-gray-400">{group.hours}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Pickup Available Badge */}
                {store.allowsPickup && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                      ✓ Pickup Available
                    </span>
                  </div>
                )}

                {/* Get Directions Button */}
                <a
                  href={
                    store.latitude && store.longitude
                      ? `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.address}, ${store.city}, ${store.state}, ${store.zipCode}, ${store.country}`)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block w-full py-3 px-4 rounded-lg font-bold text-center transition-all hover:scale-105 border-2"
                  style={{
                    borderColor: '#4ade80',
                    backgroundColor: 'transparent',
                    color: '#4ade80',
                  }}
                >
                  Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* No Stores Message */}
        {stores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">
              No store locations available at the moment.
            </p>
          </div>
        )}

        {/* Additional Contact Info */}
        <div className="mt-16 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Need More Help?
          </h2>
          <p className="text-gray-400 mb-6">
            Have questions or need assistance? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@ogfarms.co.za"
              className="px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#000',
              }}
            >
              Email Us
            </a>
            <a
              href="tel:+27123456789"
              className="px-6 py-3 rounded-full font-bold transition-all hover:scale-105 border-2"
              style={{
                borderColor: '#4ade80',
                backgroundColor: 'transparent',
                color: '#4ade80',
              }}
            >
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
