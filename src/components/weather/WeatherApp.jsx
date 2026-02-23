import { useState } from 'react'
import { format } from 'date-fns'
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
  const [forecastData, setForecastData] = useState([]) // Store forecast data for navigation

  const handleDaySelect = (day) => {
    setSelectedDay(day)
    setForecastView('daily')
  }

  // Handle day navigation for swipe gestures
  const handleNavigateDay = (day) => {
    setSelectedDay(day)
  }

  const handleBack = () => {
    if (currentScreen === 'forecast' && forecastView === 'daily') {
      setForecastView('weekly')
    } else {
      onNavigateHome()
    }
  }

  // Callback to receive forecast data from WeeklyForecast
  const handleForecastLoaded = (forecast) => {
    setForecastData(forecast)
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

  const switcherButtons = []

  // Determine header title based on current screen
  let headerTitle = ''
  if (currentScreen === 'forecast') {
    headerTitle = forecastView === 'weekly'
      ? '7-Day Forecast'
      : selectedDay?.date ? format(new Date(selectedDay.date), 'EEE, MMM d') : 'Daily Forecast'
  } else if (currentScreen === 'radar') {
    headerTitle = 'Radar'
  } else if (currentScreen === 'space') {
    headerTitle = 'Space Weather'
  }

  return (
    <div className="h-screen flex flex-col">
      <Header
        showBackButton
        onBack={handleBack}
        onOpenSettings={onOpenSettings}
        title={headerTitle}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {currentScreen === 'forecast' && (
          <>
            {forecastView === 'weekly' && (
              <WeeklyForecast
                onDaySelect={handleDaySelect}
                onForecastLoaded={handleForecastLoaded}
                refreshTrigger={refreshTrigger}
              />
            )}
            {forecastView === 'daily' && (
              <DailyForecast
                selectedDay={selectedDay}
                forecastData={forecastData}
                onNavigateDay={handleNavigateDay}
                refreshTrigger={refreshTrigger}
              />
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
