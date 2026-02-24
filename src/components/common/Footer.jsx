function Footer({ buttons = [] }) {
  return (
    <footer className="flex items-center justify-center gap-3 px-6 py-2 bg-macos-card-light/50 dark:bg-macos-card/50 backdrop-blur-xl border-t border-macos-border-light dark:border-macos-border">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          className={`
            touch-target flex-1 max-w-[200px] px-6 py-2 rounded-xl font-medium transition-all
            ${
              button.active
                ? 'bg-macos-blue-light dark:bg-macos-blue text-white shadow-lg'
                : 'bg-macos-card-light dark:bg-macos-card text-macos-text-light dark:text-macos-text hover:bg-macos-border-light dark:hover:bg-macos-border'
            }
          `}
        >
          {button.label}
        </button>
      ))}
    </footer>
  )
}

export default Footer
