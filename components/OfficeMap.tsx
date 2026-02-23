import React from 'react'

type Office = {
  id?: string
  city?: string
  name?: string
  lat: number
  lng: number
  address?: string | string[]
}

type OfficeMapProps = {
  offices?: Office[]
  activeOffice?: Office | null
}

export default function OfficeMap({ offices = [], activeOffice = null }: OfficeMapProps): JSX.Element {
  void offices
  void activeOffice

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
      <div className="relative h-96 md:h-[460px] lg:h-[520px] bg-brand-paper dark:bg-brand-dark">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-18 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] pointer-events-none" />

        {/* Bottom gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

        {/* Map iframe */}
        <div className="absolute inset-0">
          <iframe
            src="https://lifewoodworldwidemap.vercel.app/"
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-same-origin allow-scripts allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
            title="Lifewood World Map"
            className="w-full h-full border-0"
            style={{ borderRadius: 0 }}
          />
        </div>
      </div>
    </div>
  )
}
