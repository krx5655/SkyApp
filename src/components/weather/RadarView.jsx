function RadarView() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Weather Radar</h2>
        <p className="text-macos-text-secondary-light dark:text-macos-text-secondary">
          San Francisco, CA
        </p>
      </div>

      {/* Radar Map Placeholder */}
      <div className="relative rounded-2xl overflow-hidden bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border aspect-video max-w-4xl mx-auto">
        {/* Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-slate-950">
          {/* Grid Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Location Marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full w-6 h-6 animate-ping opacity-75" />
              <div className="relative bg-red-500 rounded-full w-6 h-6 border-2 border-white shadow-lg" />
            </div>
          </div>

          {/* Placeholder Precipitation Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/50 text-center">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-medium">Radar View</p>
              <p className="text-sm mt-2">Animated precipitation radar will display here</p>
            </div>
          </div>
        </div>

        {/* Radar Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <button className="px-4 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-colors touch-target">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="px-4 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg font-medium">
            Now
          </div>
          <button className="px-4 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-colors touch-target">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 flex-wrap">
        {[
          { label: 'Light', color: 'bg-green-400' },
          { label: 'Moderate', color: 'bg-yellow-400' },
          { label: 'Heavy', color: 'bg-orange-400' },
          { label: 'Severe', color: 'bg-red-500' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${item.color}`} />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Severe Weather Alert Banner (Placeholder) */}
      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 hidden">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="font-semibold text-orange-600 dark:text-orange-400">Severe Weather Alert</p>
            <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mt-1">
              No active alerts at this time
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RadarView
