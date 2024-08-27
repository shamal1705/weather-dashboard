import React, { useState, useEffect } from 'react';
import './WeatherDashboard.css';

const WeatherDashboard = () => {
    const [city, setCity] = useState(() => {
        // Get the city from local storage or default to 'Mumbai'
        return localStorage.getItem('lastSearchedCity') || 'Mumbai';
    });
    const [weatherData, setWeatherData] = useState(null);
    const [units, setUnits] = useState('metric');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [forecastData, setForecastData] = useState(null);
    const [hourlyData, setHourlyData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchWeatherData(city);
        fetchForecastData(city);
        // Update time every second
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [city, units]);

    const fetchWeatherData = (city) => {
        const apiKey = '123c3578a8ead18a8b4cfaeb0febe591';
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`)
            .then((response) => response.json())
            .then((data) => {
                setWeatherData(data);
            })
            .catch((error) => console.error('Error fetching the weather data:', error));
    };

    const fetchForecastData = (city) => {
        const apiKey = '123c3578a8ead18a8b4cfaeb0febe591';
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${apiKey}`)
            .then((response) => response.json())
            .then((data) => {
                const dailyForecasts = data.list.filter((item) => item.dt_txt.includes('12:00:00'));
                setForecastData(dailyForecasts);
                setHourlyData(data.list);
            })
            .catch((error) => console.error('Error fetching the forecast data:', error));
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherDataByCoords(latitude, longitude);
                },
                (error) => console.error('Error getting current location:', error)
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    const fetchWeatherDataByCoords = (lat, lon) => {
        const apiKey = '123c3578a8ead18a8b4cfaeb0febe591';
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`)
            .then((response) => response.json())
            .then((data) => setWeatherData(data))
            .catch((error) => console.error('Error fetching the weather data:', error));
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    const handleCityChange = (newCity) => {
        setCity(newCity);
        // Save the last searched city to local storage
        localStorage.setItem('lastSearchedCity', newCity);
        fetchWeatherData(newCity);
        fetchForecastData(newCity);
    };

    const filteredHourlyData = selectedDate ? (hourlyData?.filter(item => item.dt_txt.includes(selectedDate)) || []) : [];

    return (
        <div className={`dashboard ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="top-bar">
                <button onClick={toggleDarkMode} className="dark-mode-toggle">
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <input 
                    type="text" 
                    placeholder="Search for your preferred city..." 
                    value={city}
                    onChange={(e) => setCity(e.target.value)} 
                    onBlur={() => handleCityChange(city)}
                />
                <button onClick={getCurrentLocation} className="current-location">Current Location</button>
            </div>
            <div className="main-display">
                {weatherData ? (
                    <>
                        <div className="current-weather">
                            <h2>{weatherData.name}</h2>
                            <div className="time">{currentTime.toLocaleTimeString()}</div>
                            <div className="temperature">
                                {weatherData.main ? Math.round(weatherData.main.temp) : 'N/A'}°C
                            </div>
                            <div className="weather-icon">
                                {/* Weather Icon based on weatherData.weather[0].icon */}
                            </div>
                        </div>
                        <div className="details">
                            <div>Feels like: {weatherData.main ? Math.round(weatherData.main.feels_like) : 'N/A'}°C</div>
                            <div>Humidity: {weatherData.main ? weatherData.main.humidity : 'N/A'}%</div>
                            <div>Wind Speed: {weatherData.wind ? weatherData.wind.speed : 'N/A'} km/h</div>
                            <div>Pressure: {weatherData.main ? weatherData.main.pressure : 'N/A'} hPa</div>
                            <div>UV Index: {/* UV index calculation */}</div>
                        </div>
                    </>
                ) : (
                    <div className="loading">Loading data...</div>
                )}
            </div>
            <div className="forecast">
                <h3>5 Days Forecast:</h3>
                <div className="forecast-items">
                    {forecastData ? (
                        forecastData.map((item) => (
                            <div
                                className="forecast-item"
                                key={item.dt}
                                onClick={() => handleDateClick(item.dt_txt.split(' ')[0])}
                            >
                                <div>{new Date(item.dt_txt).toLocaleDateString()}</div>
                                <div>{Math.round(item.main.temp)}°C</div>
                                <div>{item.weather[0]?.description || 'N/A'}</div>
                            </div>
                        ))
                    ) : (
                        <div>No forecast data available.</div>
                    )}
                </div>
            </div>
            <div className={`hourly-forecast ${selectedDate ? 'show' : ''}`}>
                <h3>Hourly Forecast for {selectedDate}:</h3>
                <div className="hourly-items">
                    {filteredHourlyData.length ? (
                        filteredHourlyData.map((item) => (
                            <div className="hourly-item" key={item.dt}>
                                <div>{new Date(item.dt_txt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                                <div>{Math.round(item.main.temp)}°C</div>
                                <div>{item.weather[0]?.description || 'N/A'}</div>
                            </div>
                        ))
                    ) : (
                        <div>No hourly data available for this date.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WeatherDashboard;
