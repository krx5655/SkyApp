function SettingsModal({ onClose, theme, onToggleTheme }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-macos-card-light dark:bg-macos-card rounded-3xl shadow-2xl border border-macos-border-light dark:border-macos-border">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-macos-card-light dark:bg-macos-card border-b border-macos-border-light dark:border-macos-border">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="touch-target p-2 rounded-lg hover:bg-macos-border-light dark:hover:bg-macos-border transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Appearance</h3>
            <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </div>
                </div>
                <button
                  onClick={onToggleTheme}
                  className="touch-target px-4 py-2 rounded-lg bg-macos-blue-light dark:bg-macos-blue text-white hover:opacity-90 transition-opacity"
                >
                  Toggle
                </button>
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Location</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
                <div className="font-medium mb-2">Current Location</div>
                <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                  San Francisco, CA
                </div>
                <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary mt-1">
                  37.7749° N, 122.4194° W
                </div>
              </div>
              <button className="w-full touch-target px-4 py-3 rounded-xl bg-macos-border-light dark:bg-macos-border hover:bg-macos-blue-light/10 dark:hover:bg-macos-blue/10 transition-colors text-center font-medium">
                Add Location
              </button>
            </div>
          </section>

          {/* Units */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Units</h3>
            <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Temperature</span>
                <select className="px-3 py-2 rounded-lg bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
                  <option>Fahrenheit (°F)</option>
                  <option>Celsius (°C)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Wind Speed</span>
                <select className="px-3 py-2 rounded-lg bg-macos-card-light dark:bg-macos-card border border-macos-border-light dark:border-macos-border">
                  <option>Miles per hour (mph)</option>
                  <option>Kilometers per hour (km/h)</option>
                  <option>Meters per second (m/s)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Severe Weather Alerts</div>
                    <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                      Get notified of dangerous weather
                    </div>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Astronomical Events</div>
                    <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary">
                      Meteor showers, eclipses, etc.
                    </div>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>
              </div>
            </div>
          </section>

          {/* Data & Cache */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Data & Cache</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
                <div className="text-sm text-macos-text-secondary-light dark:text-macos-text-secondary mb-2">
                  Cached weather data: 2.4 MB
                </div>
                <button className="px-4 py-2 rounded-lg bg-macos-border-light dark:bg-macos-border hover:bg-red-500/20 transition-colors text-sm font-medium">
                  Clear Cache
                </button>
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <div className="p-4 rounded-xl bg-macos-bg-light dark:bg-macos-bg border border-macos-border-light dark:border-macos-border">
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Version:</span> 0.1.0 (MVP)</div>
                <div><span className="font-medium">Weather API:</span> Weather.gov</div>
                <div className="pt-2 text-macos-text-secondary-light dark:text-macos-text-secondary">
                  Weather & Sky App for Raspberry Pi
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 bg-macos-card-light dark:bg-macos-card border-t border-macos-border-light dark:border-macos-border">
          <button
            onClick={onClose}
            className="w-full touch-target px-6 py-3 rounded-xl bg-macos-blue-light dark:bg-macos-blue text-white font-medium hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
