"use client"

import { useEffect, useRef, useState } from 'react'

interface AddressComponents {
  street: string
  suburb: string
  city: string
  province: string
  postalCode: string
  country: string
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressComponents) => void
}

declare global {
  interface Window {
    google: any
    initAutocomplete: () => void
  }
}

export function AddressAutocomplete({ onAddressSelect }: AddressAutocompleteProps) {
  const autocompleteInputRef = useRef<HTMLInputElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if script is already loaded
    if (window.google && window.google.maps) {
      initializeAutocomplete()
      return
    }

    // Load Google Maps script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsLoaded(true)
      initializeAutocomplete()
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
    }
  }, [])

  const initializeAutocomplete = () => {
    if (!autocompleteInputRef.current || !window.google) return

    const autocomplete = new window.google.maps.places.Autocomplete(
      autocompleteInputRef.current,
      {
        componentRestrictions: { country: 'za' }, // Restrict to South Africa
        fields: ['address_components', 'formatted_address'],
        types: ['address'],
      }
    )

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      
      if (!place.address_components) return

      const addressComponents: AddressComponents = {
        street: '',
        suburb: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'South Africa',
      }

      // Parse address components
      place.address_components.forEach((component: any) => {
        const types = component.types

        if (types.includes('street_number')) {
          addressComponents.street = component.long_name + ' '
        }
        if (types.includes('route')) {
          addressComponents.street += component.long_name
        }
        if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
          addressComponents.suburb = component.long_name
        }
        if (types.includes('locality')) {
          addressComponents.city = component.long_name
        }
        if (types.includes('administrative_area_level_1')) {
          addressComponents.province = component.long_name
        }
        if (types.includes('postal_code')) {
          addressComponents.postalCode = component.long_name
        }
      })

      onAddressSelect(addressComponents)
    })
  }

  return (
    <div>
      <label className="block text-sm font-bold text-gray-300 mb-2">
        Search Address
      </label>
      <input
        ref={autocompleteInputRef}
        type="text"
        placeholder="Start typing your address..."
        className="w-full px-4 py-3 rounded-lg bg-black/50 border text-white focus:outline-none focus:border-primary"
        style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
      />
      <p className="text-xs text-gray-500 mt-1">
        Start typing to search for your address
      </p>
    </div>
  )
}
