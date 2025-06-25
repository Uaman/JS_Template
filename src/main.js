class WeatherDay
{
    constructor(title, low, high, humidity, description, weatherEmoji, windSpeed)
    {
        this.title = title;
        this.high = Math.round(high);
        this.low = Math.round(low);
        this.humidity = humidity;
        this.weatherEmoji = weatherEmoji;
        this.description = description;
        this.windSpeed = windSpeed;
    }

    getHtml(ind) {
        return `
        <div class="forecast-day" id="forecastDay${ind}" onclick="selectDay(${ind});">
            <p class="day-name">${this.title}</p>
            <div class="icon-small">${this.weatherEmoji}</div>
            <p class="day-temp-high">${this.high}°C</p>
            <p class="day-temp-low">${this.low}°C</p>
        </div>
        `
    } 

    getSuperHtml(cityName)
    {
        return `
        <div class="weather-info">
            <h1 class="city">${cityName}</h1>
            <p class="country">Ukraine</p> <!-- This is hardcoded, API can provide country too -->
            <p class="temperature">${this.high}°C</p>
            <p class="description">${this.description}</p>
        </div>

        <div class="weather-icon">
            <div class="icon-main">${this.weatherEmoji}</div>
        </div>

        <section class="weather-details">
            <p>Wind: ${this.windSpeed} km/h</p>
            <p>Humidity: ${this.humidity}%</p>
        </section>
        `
    }
}

// --- NEW HELPER FUNCTION for Open-Meteo's weather codes ---
function getWeatherInfoFromCode(code) {
    const weatherMap = {
        0: { description: 'Clear sky', emoji: '☀️' },
        1: { description: 'Mainly clear', emoji: '🌤️' },
        2: { description: 'Partly cloudy', emoji: '⛅️' },
        3: { description: 'Overcast', emoji: '☁️' },
        45: { description: 'Fog', emoji: '🌫️' },
        48: { description: 'Depositing rime fog', emoji: '🌫️' },
        51: { description: 'Light drizzle', emoji: '🌦️' },
        53: { description: 'Moderate drizzle', emoji: '🌦️' },
        55: { description: 'Dense drizzle', emoji: '🌦️' },
        56: { description: 'Light freezing drizzle', emoji: '🌦️❄️' },
        57: { description: 'Dense freezing drizzle', emoji: '🌦️❄️' },
        61: { description: 'Slight rain', emoji: '🌧️' },
        63: { description: 'Moderate rain', emoji: '🌧️' },
        65: { description: 'Heavy rain', emoji: '🌧️' },
        66: { description: 'Light freezing rain', emoji: '🌧️❄️' },
        67: { description: 'Heavy freezing rain', emoji: '🌧️❄️' },
        71: { description: 'Slight snow fall', emoji: '❄️' },
        73: { description: 'Moderate snow fall', emoji: '❄️' },
        75: { description: 'Heavy snow fall', emoji: '❄️' },
        77: { description: 'Snow grains', emoji: '❄️' },
        80: { description: 'Slight rain showers', emoji: '🌦️' },
        81: { description: 'Moderate rain showers', emoji: '🌦️' },
        82: { description: 'Violent rain showers', emoji: '⛈️' },
        85: { description: 'Slight snow showers', emoji: '❄️' },
        86: { description: 'Heavy snow showers', emoji: '❄️' },
        95: { description: 'Thunderstorm', emoji: '⛈️' },
        96: { description: 'Thunderstorm with slight hail', emoji: '⛈️' },
        99: { description: 'Thunderstorm with heavy hail', emoji: '⛈️' },
    };
    return weatherMap[code] || { description: 'Unknown', emoji: '🌡️' };
}


let days = new Array();
let selectedDay = 0;
let selectedCity = "Kyiv";


async function loadWeather(cityName)
{
    selectedCity = cityName;

    try {

        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            alert(`Could not find city: ${cityName}. Please try again.`);
            return;
        }

        const { latitude, longitude } = geoData.results[0];

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max&hourly=relativehumidity_2m&timezone=auto`;
        
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        
        // This check handles the 400 Bad Request error properly
        if (weatherData.error) {
            alert(`Error from weather API: ${weatherData.reason}`);
            return;
        }
        
        days = []; // Clear old forecast
        
        const daily = weatherData.daily;
        const hourly = weatherData.hourly;

        for (let i = 0; i < daily.time.length; i++) {
            const date = daily.time[i];
            const high = daily.temperature_2m_max[i];
            const low = daily.temperature_2m_min[i];
            const windSpeed = daily.windspeed_10m_max[i];
            const weatherCode = daily.weathercode[i];

            // Get humidity for 2 PM (index 14) for the corresponding day as a representative value
            // The hourly array has 24 entries per day. Day 'i' starts at index i * 24.
            const humidity = hourly.relativehumidity_2m[i * 24 + 14];

            const { description, emoji } = getWeatherInfoFromCode(weatherCode);
            const dayTitle = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

            days.push(new WeatherDay(
                dayTitle,
                low,
                high,
                humidity, // Use the extracted hourly humidity
                description,
                emoji,
                Math.round(windSpeed)
            ));
        }

        let res_list = "";
        for (let i = 0; i < days.length; i++) {
            res_list += days[i].getHtml(i);
        }
        document.getElementById('forecast-track').innerHTML = res_list;

        if(selectedDay >= days.length) {
            selectedDay = 0;
        }
        selectDay(selectedDay);

    } catch (error) {
        console.error("Failed to fetch weather data:", error);
        alert("Could not fetch weather data. Please check your connection or browser console.");
    }
}

// Initial load
loadWeather(selectedCity);


function selectDay(ind) {
    selectedDay = ind;
    if (days[selectedDay]) {
        // Assuming you have an element with the id 'super-forecast' to display the main weather info
        document.getElementById('super-forecast').innerHTML = days[selectedDay].getSuperHtml(selectedCity);
        
        // Update active class for styling
        const allDays = document.querySelectorAll('.forecast-day');
        allDays.forEach(day => day.classList.remove('active'));
        document.getElementById(`forecastDay${ind}`).classList.add('active');
    }
}

// Initial load
loadWeather(selectedCity);

// You must have a 'selectDay' function defined elsewhere in your code.
// Here is a sample placeholder for it to work.
function selectDay(ind) {
    selectedDay = ind;
    if (days[selectedDay]) {
        // Assuming you have an element with the id 'super-forecast' to display the main weather info
        document.getElementById('super-forecast').innerHTML = days[selectedDay].getSuperHtml(selectedCity);
        
        // Update active class for styling
        const allDays = document.querySelectorAll('.forecast-day');
        allDays.forEach(day => day.classList.remove('active'));
        document.getElementById(`forecastDay${ind}`).classList.add('active');
    }
}

function selectDay(dayN)
{
    selectedDay = dayN
    for (let i = 0; i < days.length; i++) {
        if (i == selectedDay) 
        {
            document.getElementById("forecastDay"+i).className = "forecast-day selected"
            document.getElementById("weather-display-grid").innerHTML = days[i].getSuperHtml(selectedCity);
        }
        else document.getElementById("forecastDay"+i).className = "forecast-day"
    }
}

function selectCity()
{
    selectName = document.getElementById("cityText").value
    console.log("Selecting city: " + selectName)
    loadWeather(selectName)
}