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
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Check if API key is configured
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setHasError(true)
      setErrorMessage('Address autocomplete is not configured. Please enter your address manually.')
      return
    }

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
    script.onerror = () => {
      setHasError(true)
      setErrorMessage('Failed to load address autocomplete. Please enter your address manually.')
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
    }
  }, [])

  const initializeAutocomplete = () => {
    if (!autocompleteInputRef.current || !window.google) {
      setHasError(true)
      setErrorMessage('Address autocomplete unavailable. Please enter your address manually.')
      return
    }

    try {
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

      // Listen for API errors (quota exceeded, etc.)
      window.google.maps.event.addListener(autocomplete, 'error', () => {
        setHasError(true)
        setErrorMessage('Address search limit reached. Please enter your address manually.')
      })
    } catch (error) {
      setHasError(true)
      setErrorMessage('Address autocomplete error. Please enter your address manually.')
    }
  }

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        Search Address {!hasError && '(Optional)'}
      </label>
      {hasError ? (
        <div className="p-4 rounded-lg border border-yellow-400 bg-yellow-50 mb-2">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Address Autocomplete Unavailable</p>
              <p className="text-xs text-yellow-700 mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <input
            ref={autocompleteInputRef}
            type="text"
            placeholder="Start typing your address..."
            className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
            style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Start typing to search for your address, or fill in the fields below manually
          </p>
        </>
      )}
    </div>
  )
}
