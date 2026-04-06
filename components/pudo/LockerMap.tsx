'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X, Navigation, Clock, CheckCircle2 } from 'lucide-react'

interface Locker {
  id: string
  code: string
  name: string
  address: string
  latitude?: string | number | null
  longitude?: string | number | null
  town?: string | null
  postalCode?: string | null
}

interface LockerMapProps {
  lockers: Locker[]
  selectedLocker: Locker | null
  onSelectLocker: (locker: Locker) => void
  loadingRate?: boolean
  rate?: number | null
}

export default function LockerMap({ lockers, selectedLocker, onSelectLocker, loadingRate, rate }: LockerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [search, setSearch] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const [hoveredLocker, setHoveredLocker] = useState<Locker | null>(null)
  const [listOpen, setListOpen] = useState(false)

  const filtered = lockers.filter(l =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.town ?? '').toLowerCase().includes(search.toLowerCase()) ||
    l.address.toLowerCase().includes(search.toLowerCase())
  )

  // Init Leaflet (client-only)
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    import('leaflet').then(L => {
      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [-28.7, 24.7],
        zoom: 5,
        zoomControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      leafletMapRef.current = map
      setMapReady(true)
    })

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  // Render markers when map is ready and lockers change
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return

    import('leaflet').then(L => {
      const map = leafletMapRef.current

      // Clear old markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      const validLockers = lockers.filter(l => {
        const lat = parseFloat(String(l.latitude))
        const lng = parseFloat(String(l.longitude))
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
      })

      validLockers.forEach(locker => {
        const lat = parseFloat(String(locker.latitude))
        const lng = parseFloat(String(locker.longitude))
        const isSelected = selectedLocker?.code === locker.code

        const iconHtml = `
          <div style="
            width: ${isSelected ? '32px' : '24px'};
            height: ${isSelected ? '32px' : '24px'};
            background: ${isSelected ? '#4ade80' : '#16a34a'};
            border: 2px solid ${isSelected ? '#fff' : '#4ade80'};
            border-radius: 50%;
            box-shadow: 0 0 ${isSelected ? '12px' : '4px'} ${isSelected ? 'rgba(74,222,128,0.8)' : 'rgba(74,222,128,0.4)'};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            cursor: pointer;
          ">
            <div style="
              width: ${isSelected ? '10px' : '8px'};
              height: ${isSelected ? '10px' : '8px'};
              background: ${isSelected ? '#000' : '#fff'};
              border-radius: 50%;
            "></div>
          </div>
        `

        const icon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
          iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
        })

        const marker = L.marker([lat, lng], { icon })
          .on('click', () => {
            onSelectLocker(locker)
            map.setView([lat, lng], Math.max(map.getZoom(), 13), { animate: true })
          })
          .addTo(map)

        markersRef.current.push(marker)
      })
    })
  }, [mapReady, lockers, selectedLocker])

  // Pan to selected locker
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !selectedLocker) return
    const lat = parseFloat(String(selectedLocker.latitude))
    const lng = parseFloat(String(selectedLocker.longitude))
    if (!isNaN(lat) && !isNaN(lng)) {
      leafletMapRef.current.setView([lat, lng], 14, { animate: true })
    }
  }, [selectedLocker, mapReady])

  const locateMeOnMap = () => {
    if (!leafletMapRef.current) return
    navigator.geolocation?.getCurrentPosition(pos => {
      leafletMapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 12, { animate: true })
    })
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="relative w-full">
      {/* Load DM Sans */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Map container */}
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: 360, border: '1.5px solid rgba(74,222,128,0.25)' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating search bar */}
        <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search lockers by town or name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(74,222,128,0.3)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={locateMeOnMap}
            title="Use my location"
            className="px-3 rounded-lg text-green-400 hover:text-green-300 transition-colors"
            style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(74,222,128,0.3)' }}
          >
            <Navigation className="h-4 w-4" />
          </button>
          <button
            onClick={() => setListOpen(v => !v)}
            className="px-3 py-2 rounded-lg text-xs font-bold text-black transition-colors"
            style={{ background: listOpen ? '#4ade80' : 'rgba(74,222,128,0.85)', backdropFilter: 'blur(12px)' }}
          >
            {listOpen ? 'Map' : 'List'}
          </button>
        </div>

        {/* Locker count badge */}
        <div className="absolute bottom-3 left-3 z-[1000]">
          <span className="text-xs font-semibold px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(10,10,10,0.85)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
            {filtered.length} locker{filtered.length !== 1 ? 's' : ''} {search ? 'found' : 'nationwide'}
          </span>
        </div>

        {/* List overlay */}
        {listOpen && (
          <div className="absolute inset-0 z-[999] overflow-y-auto" style={{ background: 'rgba(5,5,5,0.97)', backdropFilter: 'blur(8px)' }}>
            <div className="p-3 space-y-1.5 pt-16">
              {filtered.slice(0, 80).map(locker => {
                const isSelected = selectedLocker?.code === locker.code
                return (
                  <button
                    key={locker.code}
                    onClick={() => { onSelectLocker(locker); setListOpen(false) }}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg transition-all flex items-start gap-3"
                    style={{
                      background: isSelected ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: isSelected ? '#4ade80' : '#6b7280' }} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: isSelected ? '#4ade80' : '#fff' }}>{locker.name}</p>
                      <p className="text-xs text-gray-400 truncate">{locker.town ? `${locker.town} · ` : ''}{locker.address}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 ml-auto shrink-0 text-green-400 mt-0.5" />}
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No lockers match your search</p>
              )}
              {filtered.length > 80 && (
                <p className="text-center text-gray-500 text-xs py-2">Showing first 80 results — refine your search</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected locker card */}
      {selectedLocker ? (
        <div className="mt-3 p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(74,222,128,0.08)', border: '1.5px solid rgba(74,222,128,0.3)' }}>
          <div className="mt-0.5 p-2 rounded-lg shrink-0" style={{ background: 'rgba(74,222,128,0.15)' }}>
            <MapPin className="h-4 w-4 text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">{selectedLocker.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{selectedLocker.address}</p>
            {selectedLocker.town && <p className="text-xs text-gray-500">{selectedLocker.town}{selectedLocker.postalCode ? `, ${selectedLocker.postalCode}` : ''}</p>}
          </div>
          <div className="text-right shrink-0">
            {loadingRate ? (
              <span className="text-xs text-green-400 animate-pulse">Calculating…</span>
            ) : rate !== null && rate !== undefined ? (
              <div>
                <p className="text-xs text-gray-500">Shipping</p>
                <p className="text-base font-bold text-green-400">R{rate.toFixed(2)}</p>
                <p className="text-xs text-gray-500">incl. VAT</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(74,222,128,0.2)' }}>
          <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
          <p className="text-sm text-gray-500">Click a pin on the map or use the list to pick a locker</p>
        </div>
      )}
    </div>
  )
}
