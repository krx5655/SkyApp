function PlanetsView({ view, direction }) {
  const mockPlanets = [
    { name: 'Venus', visible: true, magnitude: -4.2, rise: '5:30 AM', set: '6:45 PM' },
    { name: 'Mars', visible: true, magnitude: 0.5, rise: '8:15 PM', set: '6:20 AM' },
    { name: 'Jupiter', visible: true, magnitude: -2.1, rise: '9:30 PM', set: '8:10 AM' },
    { name: 'Saturn', visible: false, magnitude: 0.8, rise: '3:20 AM', set: '2:45 PM' },
  ]

  if (view === 'solar') {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Solar System View</h2>
          <p className="text-macos-text-secondary-light dark:text-macos-text-secondary">
            Top-down orbital diagram
          </p>
        </div>

        {/* Solar System Diagram Placeholder */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-black aspect-square max-w-2xl mx-auto border border-macos-border-light dark:border-macos-border">
          {/* Sun */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 rounded-full bg-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.8)]" />
          </div>

          {/* Orbital Rings */}
          {[60, 100, 140, 180, 220, 260, 300, 340].map((size, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-700/50"
              style={{ width: `${size}px`, height: `${size}px` }}
            />
          ))}

          {/* Placeholder Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/50 text-center mt-48">
              <p className="text-sm">Interactive solar system view</p>
              <p className="text-xs mt-1">3D orbital diagram with current planet positions</p>
            </div>
          </div>
        </div>

        {/* Placeholder Note */}
        <div className="text-center p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 max-w-2xl mx-auto">
          <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
            This is placeholder UI. Solar system visualization will be implemented using Three.js in Phase 2.
          </p>
        </div>
      </div>
    )
  }

  // Earth View
  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Visible Planets</h2>
        <p className="text-macos-text-secondary-light dark:text-macos-text-secondary">
          Looking {direction === 'N' ? 'North' : direction === 'E' ? 'East' : direction === 'S' ? 'South' : 'West'}
        </p>
      </div>

      {/* Sky Dome Visualization Placeholder */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-blue-900 via-purple-900 to-orange-900 aspect-video max-w-3xl mx-auto border border-macos-border-light dark:border-macos-border">
        {/* Horizon Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/30" />

        {/* Direction Label */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg">
          <span className="text-white font-medium">{direction}</span>
        </div>

        {/* Placeholder Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/70 text-center">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">Sky dome view showing planet positions</p>
            <p className="text-xs mt-1">Based on current time and compass direction</p>
          </div>
        </div>
      </div>

      {/* Planet List */}
      <div className="grid gap-4 max-w-2xl mx-auto">
        {mockPlanets.map((planet) => (
          <div
            key={planet.name}
            className={`p-6 rounded-2xl border transition-all ${
              planet.visible
                ? 'bg-macos-card-light dark:bg-macos-card border-macos-border-light dark:border-macos-border'
                : 'bg-macos-card-light/50 dark:bg-macos-card/50 border-macos-border-light/50 dark:border-macos-border/50 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${planet.visible ? 'bg-green-500' : 'bg-gray-500'}`} />
                <div>
                  <h3 className="text-xl font-bold">{planet.name}</h3>
                  <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                    Magnitude: {planet.magnitude}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-macos-text-secondary-light dark:text-macos-text-secondary">Rise</div>
                <div className="font-medium">{planet.rise}</div>
                <div className="text-macos-text-secondary-light dark:text-macos-text-secondary mt-1">Set</div>
                <div className="font-medium">{planet.set}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder Note */}
      <div className="text-center p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 max-w-2xl mx-auto">
        <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
          This is placeholder data. Real-time planet calculations and sky positioning will be implemented in Phase 2.
        </p>
      </div>
    </div>
  )
}

export default PlanetsView
