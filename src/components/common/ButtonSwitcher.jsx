function ButtonSwitcher({ buttons = [] }) {
  if (buttons.length === 0) return null

  return (
    <div className="flex items-center justify-center gap-2 px-6 py-3 bg-macos-card-light/30 dark:bg-macos-card/30">
      <div className="inline-flex items-center gap-1 p-1 bg-macos-border-light dark:bg-macos-border rounded-xl">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className={`
              touch-target px-6 py-2 rounded-lg font-medium text-sm transition-all
              ${
                button.active
                  ? 'bg-macos-card-light dark:bg-macos-card text-macos-blue-light dark:text-macos-blue shadow-md'
                  : 'text-macos-text-secondary-light dark:text-macos-text-secondary hover:text-macos-text-light dark:hover:text-macos-text'
              }
            `}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ButtonSwitcher
