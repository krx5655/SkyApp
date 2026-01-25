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
  const [forecastData, setForecastData] = useState([]) // Store forecast data for navigation

  const handleDaySelect = (day) => {
    setSelectedDay(day)
    setForecastView('daily')
  }

  // Handle day navigation for swipe gestures
  const handleNavigateDay = (day) => {
    setSelectedDay(day)
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

  const switcherButtons = currentScreen === 'forecast' ? [
    {
      label: 'Weekly',
      active: forecastView === 'weekly',
      onClick: () => setForecastView('weekly'),
    },
    {
      label: 'Daily',
      active: forecastView === 'daily',
      onClick: () => {
        // If no day is selected, select today
        if (!selectedDay && forecastData.length > 0) {
          const today = new Date()
          const todayForecast = forecastData.find(day => {
            const dayDate = new Date(day.date)
            return dayDate.toDateString() === today.toDateString()
          })
          if (todayForecast) {
            setSelectedDay(todayForecast)
          } else {
            // If today is not in the forecast, select the first day
            setSelectedDay(forecastData[0])
          }
        }
        setForecastView('daily')
      },
    },
  ] : []

  // Determine header title based on current screen
  let headerTitle = ''
  if (currentScreen === 'forecast') {
    headerTitle = forecastView === 'weekly' ? '7-Day Forecast' : 'Daily Forecast'
  } else if (currentScreen === 'radar') {
    headerTitle = 'Radar'
  } else if (currentScreen === 'space') {
    headerTitle = 'Space Weather'
  }

  return (
    <div className="h-screen flex flex-col">
      <Header
        showBackButton
        onBack={onNavigateHome}
        onOpenSettings={onOpenSettings}
        title={headerTitle}
      />

      <main className="flex-1 overflow-y-auto">
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
