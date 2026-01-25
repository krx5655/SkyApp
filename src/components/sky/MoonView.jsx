function MoonView() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}


      {/* Moon Visualization Placeholder */}
      <div className="max-w-md mx-auto">
        <div className="relative aspect-square rounded-full bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-slate-950 border border-macos-border-light dark:border-macos-border shadow-2xl">
          {/* Moon Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-48 h-48 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-2xl font-bold">Waning Gibbous</p>
          <p className="text-macos-text-secondary-light dark:text-macos-text-secondary">78% Illuminated</p>
        </div>
      </div>

      {/* Moon Details Grid */}
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
          <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-1">
            Moonrise
          </div>
          <div className="text-2xl font-bold">8:42 PM</div>
        </div>

        <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
          <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-1">
            Moonset
          </div>
          <div className="text-2xl font-bold">7:15 AM</div>
        </div>

        <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
          <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-1">
            Next Full Moon
          </div>
          <div className="text-2xl font-bold">5 days</div>
        </div>

        <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
          <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-1">
            Next New Moon
          </div>
          <div className="text-2xl font-bold">19 days</div>
        </div>
      </div>

      {/* Position Information */}
      <div className="p-6 rounded-2xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Current Position</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-1">
              Altitude
            </div>
            <div className="text-xl font-bold">45.2°</div>
          </div>
          <div>
            <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-1">
              Azimuth
            </div>
            <div className="text-xl font-bold">142.8° SE</div>
          </div>
        </div>
      </div>

      {/* Placeholder Note */}
      <div className="text-center p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 max-w-2xl mx-auto">
        <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
          This is placeholder data. Real-time lunar calculations will be implemented in Phase 2.
        </p>
      </div>
    </div>
  )
}

export default MoonView
