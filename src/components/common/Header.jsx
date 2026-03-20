import { useState, useEffect } from 'react'
import { format } from 'date-fns'

function Header({ showBackButton = false, onBack, onOpenSettings, title = null }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <header className="flex items-center justify-between px-6 py-2 bg-macos-card-light/50 dark:bg-macos-card/50 backdrop-blur-xl">
      {/* Left side - Back button or empty space */}
      <div className="flex items-center min-w-[120px]">
        {showBackButton ? (
          <button
            onClick={onBack}
            className="touch-target flex items-center gap-1 text-macos-blue-muted-light dark:text-macos-blue-muted hover:opacity-70 transition-opacity"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">Back</span>
          </button>
        ) : null}
      </div>

      {/* Center - Title (optional) */}
      <div className="flex-1 text-center">
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
      </div>

      {/* Right side - Date/Time and Settings */}
      <div className="flex items-center gap-4 min-w-[120px] justify-end">
        <div className="text-right">
          <div className="text-sm font-semibold">
            {format(currentTime, 'h:mm a')}
          </div>
          <div className="text-xs text-macos-text-secondary-light dark:text-macos-text-secondary">
            {format(currentTime, 'MMM d, yyyy')}
          </div>
        </div>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="touch-target p-2 rounded-lg hover:bg-macos-border-light dark:hover:bg-macos-border transition-colors"
            aria-label="Settings"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
