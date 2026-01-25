function StarsView({ direction }) {
  const mockConstellations = [
    { name: 'Orion', visible: true, stars: 7 },
    { name: 'Ursa Major', visible: true, stars: 7 },
    { name: 'Cassiopeia', visible: true, stars: 5 },
    { name: 'Andromeda', visible: false, stars: 6 },
  ]

  const mockBrightStars = [
    { name: 'Sirius', magnitude: -1.46, constellation: 'Canis Major' },
    { name: 'Betelgeuse', magnitude: 0.42, constellation: 'Orion' },
    { name: 'Rigel', magnitude: 0.13, constellation: 'Orion' },
    { name: 'Polaris', magnitude: 1.98, constellation: 'Ursa Minor' },
  ]

  return (
    <div className="p-6 space-y-6">


      {/* Interactive Sky Map Placeholder */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-black aspect-video max-w-3xl mx-auto border border-macos-border-light dark:border-macos-border">
        {/* Stars */}
        {Array.from({ length: 50 }).map((_, i) => {
          const size = Math.random() * 3 + 1
          const x = Math.random() * 100
          const y = Math.random() * 100
          const opacity = Math.random() * 0.5 + 0.5
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}%`,
                top: `${y}%`,
                opacity,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          )
        })}

        {/* Direction Label */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg z-10">
          <span className="text-white font-medium">{direction}</span>
        </div>

        {/* Horizon Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20" />

        {/* Placeholder Text */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-white/70 text-center bg-black/40 backdrop-blur-sm p-6 rounded-xl">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <p className="text-sm font-medium">Interactive Star Map</p>
            <p className="text-xs mt-1">Real-time constellation positions</p>
            <p className="text-xs">Bright stars labeled and highlighted</p>
          </div>
        </div>
      </div>

      {/* Visible Constellations */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Visible Constellations</h3>
        <div className="grid grid-cols-2 gap-3">
          {mockConstellations.map((constellation) => (
            <div
              key={constellation.name}
              className={`p-4 rounded-xl border ${constellation.visible
                  ? 'bg-macos-card-light dark:bg-macos-card border-macos-border-light dark:border-macos-border'
                  : 'bg-macos-card-light/50 dark:bg-macos-card/50 border-macos-border-light/50 dark:border-macos-border/50 opacity-60'
                }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${constellation.visible ? 'bg-blue-500' : 'bg-gray-500'}`} />
                <h4 className="font-semibold">{constellation.name}</h4>
              </div>
              <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                {constellation.stars} major stars
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bright Stars */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Bright Stars</h3>
        <div className="space-y-3">
          {mockBrightStars.map((star) => (
            <div
              key={star.name}
              className="p-4 rounded-xl bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border flex items-center justify-between"
            >
              <div>
                <h4 className="font-semibold">{star.name}</h4>
                <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                  {star.constellation}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                  Magnitude
                </div>
                <div className="font-bold">{star.magnitude}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder Note */}
      <div className="text-center p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 max-w-2xl mx-auto">
        <p className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
          This is placeholder data. Real-time star positions and constellation mapping will be implemented in Phase 2.
        </p>
      </div>
    </div>
  )
}

export default StarsView
