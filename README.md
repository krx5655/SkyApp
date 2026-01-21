# Weather & Sky App

A touchscreen application for Raspberry Pi displaying real-time weather and astronomical data.

## Tech Stack

- **Electron** - Desktop app framework with kiosk mode
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **date-fns** - Date formatting

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts the Vite dev server at http://localhost:5173

### Run with Electron

```bash
npm run electron:dev
```

This starts both the Vite dev server and Electron window.

### Kiosk Mode

To run in kiosk mode (fullscreen, no chrome):

```bash
npm run electron:dev -- --kiosk
```

## Project Structure

```
src/
├── components/
│   ├── common/        # Shared components (Header, Footer, etc.)
│   ├── home/          # Main screen
│   ├── weather/       # Weather app screens
│   └── sky/           # Sky app screens
├── styles/
│   └── tailwind.css   # Global styles
├── App.jsx            # Main app component
└── main.jsx           # React entry point
```

## Current Status

**Phase 1 (MVP) - In Progress**
- ✅ Basic project structure
- ✅ Navigation between screens
- ✅ Weather app UI (mock data)
- ✅ Sky app UI (placeholder)
- ✅ Settings modal
- ⏳ API integration (next step)

## Development Notes

- Currently using mock data for weather
- Sky app shows placeholder UI
- Develop on Mac Mini, deploy to Raspberry Pi
- Target display: 1024x600, but responsive design for flexibility

## Next Steps

1. Integrate Weather.gov API
2. Add real location management
3. Implement astronomy calculations
4. Add animations with Framer Motion
5. Test on Raspberry Pi hardware
