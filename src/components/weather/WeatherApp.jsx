import { useState } from 'react'
import Header from '../common/Header'
import Footer from '../common/Footer'
import ButtonSwitcher from '../common/ButtonSwitcher'
import WeeklyForecast from './WeeklyForecast'
import DailyForecast from './DailyForecast'
import RadarView from './RadarView'
import SpaceWeatherView from './SpaceWeatherView'

function WeatherApp({ onNavigateHome, onOpenSettings, refreshTrigger }) {
  const [currentScreen, setCurrentScreen] = useState('forecast') // 'forecast', 'radar', 'space'
  const [forecastView, setForecastView] = useState('weekly') // 'weekly', 'daily'
  const [selectedDay, setSelectedDay] = useState(null)

  const handleDaySelect = (day) => {
    setSelectedDay(day)
    setForecastView('daily')
  }

  const footerButtons = [
    {
      label: 'Forecast',
      active: currentScreen === 'forecast',
      onClick: () => setCurrentScreen('forecast'),
    },
    {
      label: 'Radar',
      active: currentScreen === 'radar',
      onClick: () => setCurrentScreen('radar'),
    },
    {
      label: 'Space Weather',
      active: currentScreen === 'space',
      onClick: () => setCurrentScreen('space'),
    },
  ]

  const switcherButtons = currentScreen === 'forecast' ? [
    {
      label: 'Weekly',
      active: forecastView === 'weekly',
      onClick: () => setForecastView('weekly'),
    },
    {
      label: 'Daily',
      active: forecastView === 'daily',
      onClick: () => setForecastView('daily'),
    },
  ] : []

  return (
    <div className="h-screen flex flex-col">
      <Header
        showBackButton
        onBack={onNavigateHome}
        onOpenSettings={onOpenSettings}
      />

      <main className="flex-1 overflow-y-auto">
        {currentScreen === 'forecast' && (
          <>
            {forecastView === 'weekly' && (
              <WeeklyForecast onDaySelect={handleDaySelect} refreshTrigger={refreshTrigger} />
            )}
            {forecastView === 'daily' && (
              <DailyForecast selectedDay={selectedDay} />
            )}
          </>
        )}
        {currentScreen === 'radar' && <RadarView />}
        {currentScreen === 'space' && <SpaceWeatherView />}
      </main>

      <ButtonSwitcher buttons={switcherButtons} />
      <Footer buttons={footerButtons} />
    </div>
  )
}

export default WeatherApp
