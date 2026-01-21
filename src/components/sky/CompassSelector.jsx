function CompassSelector({ direction, onDirectionChange }) {
  const directions = [
    { value: 'N', label: 'North' },
    { value: 'E', label: 'East' },
    { value: 'S', label: 'South' },
    { value: 'W', label: 'West' },
  ]

  return (
    <div className="flex items-center justify-center gap-2 px-6 py-3 bg-macos-card-light/30 dark:bg-macos-card/30 border-b border-macos-border-light dark:border-macos-border">
      <svg className="w-5 h-5 text-macos-text-secondary-light dark:text-macos-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
      <div className="inline-flex items-center gap-1 p-1 bg-macos-border-light dark:bg-macos-border rounded-xl">
        {directions.map((dir) => (
          <button
            key={dir.value}
            onClick={() => onDirectionChange(dir.value)}
            className={`
              touch-target px-5 py-2 rounded-lg font-medium text-sm transition-all
              ${
                direction === dir.value
                  ? 'bg-macos-card-light dark:bg-macos-card text-macos-blue-light dark:text-macos-blue shadow-md'
                  : 'text-macos-text-secondary-light dark:text-macos-text-secondary hover:text-macos-text-light dark:hover:text-macos-text'
              }
            `}
            aria-label={dir.label}
          >
            {dir.value}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CompassSelector
