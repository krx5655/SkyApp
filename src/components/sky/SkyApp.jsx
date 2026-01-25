import { useState } from 'react'
import Header from '../common/Header'
import Footer from '../common/Footer'
import ButtonSwitcher from '../common/ButtonSwitcher'
import CompassSelector from './CompassSelector'
import MoonView from './MoonView'
import PlanetsView from './PlanetsView'
import StarsView from './StarsView'

function SkyApp({ onNavigateHome, onOpenSettings }) {
  const [currentScreen, setCurrentScreen] = useState('moon') // 'moon', 'planets', 'stars'
  const [planetView, setPlanetView] = useState('earth') // 'earth', 'solar'
  const [compassDirection, setCompassDirection] = useState('N') // 'N', 'E', 'S', 'W'

  const footerButtons = [
    {
      label: 'Moon',
      active: currentScreen === 'moon',
      onClick: () => setCurrentScreen('moon'),
    },
    {
      label: 'Planets',
      active: currentScreen === 'planets',
      onClick: () => setCurrentScreen('planets'),
    },
    {
      label: 'Stars',
      active: currentScreen === 'stars',
      onClick: () => setCurrentScreen('stars'),
    },
  ]

  const switcherButtons = currentScreen === 'planets' ? [
    {
      label: 'Earth View',
      active: planetView === 'earth',
      onClick: () => setPlanetView('earth'),
    },
    {
      label: 'Solar System',
      active: planetView === 'solar',
      onClick: () => setPlanetView('solar'),
    },
  ] : []

  const showCompass = (currentScreen === 'planets' && planetView === 'earth') || currentScreen === 'stars'

  // Determine header title based on current screen
  let headerTitle = ''
  if (currentScreen === 'moon') {
    headerTitle = 'Moon'
  } else if (currentScreen === 'planets') {
    headerTitle = 'Planets'
  } else if (currentScreen === 'stars') {
    headerTitle = 'Stars'
  }

  return (
    <div className="h-screen flex flex-col">
      <Header
        showBackButton
        onBack={onNavigateHome}
        onOpenSettings={onOpenSettings}
        title={headerTitle}
      />

      {showCompass && (
        <CompassSelector
          direction={compassDirection}
          onDirectionChange={setCompassDirection}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        {currentScreen === 'moon' && <MoonView />}
        {currentScreen === 'planets' && (
          <PlanetsView view={planetView} direction={compassDirection} />
        )}
        {currentScreen === 'stars' && (
          <StarsView direction={compassDirection} />
        )}
      </main>

      <ButtonSwitcher buttons={switcherButtons} />
      <Footer buttons={footerButtons} />
    </div>
  )
}

export default SkyApp
