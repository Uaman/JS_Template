const API_KEY = 'FF7ZYNQQ68ZK9BB677FAW6CTX';
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';

const searchBtn = document.querySelector('.search-btn');
const cityInput = document.getElementById('cityInput');
const cityElem = document.querySelector('.city');
const countryElem = document.querySelector('.country');
const tempElem = document.querySelector('.temp h1');
const conditionElem = document.querySelector('.condition');
const windElem = document.querySelector('.extra-info p:nth-child(1)');
const humidityElem = document.querySelector('.extra-info p:nth-child(2)');
const forecastCarousel = document.querySelector('.forecast-carousel');
const weatherIcon = document.querySelector('.current-weather-icon img');

//  Створення та приховування попапу
const popup = document.createElement('div');
popup.classList.add('popup');
document.body.appendChild(popup);
popup.style.display = 'none';

async function fetchWeather(city) {
    const url = `${BASE_URL}${city}?unitGroup=metric&key=${API_KEY}&contentType=json&include=days`;

    //  Відправляється асинхронний запит на сервер, отримується відповідь і перетворюється в об'єкт JSON.
    const res = await fetch(url);
    const data = await res.json();
    forecastData = data.days.slice(0, 10); // Зберігається тільки перших 10 днів прогнозу

    //  Збереження прогнозу і назви міста
    localStorage.setItem('weatherForecast', JSON.stringify(forecastData));
    localStorage.setItem('forecastCity', data.resolvedAddress);

    updateMainWeather(data);
    updateForecast();
}

function updateMainWeather(data, dayIndex = 0) {
    const day = forecastData[dayIndex];     //  Вибирається день (за замовчуванням -- сьогодні)
    cityElem.textContent = data.resolvedAddress.split(',')[0];
    countryElem.textContent = data.resolvedAddress.split(',')[1]?.trim() || '';
    tempElem.textContent = `${Math.round(day.temp)}°C`;
    conditionElem.textContent = day.conditions;
    windElem.textContent = `Wind: ${day.windspeed} km/h`;
    humidityElem.textContent = `Humidity: ${day.humidity}%`;
    weatherIcon.src = getIcon(day.icon);
}

function updateForecast() {
    forecastCarousel.innerHTML = '';
    forecastData.forEach((day, index) => {
        const forecastDay = document.createElement('div');
        forecastDay.classList.add('forecast-day');
        forecastDay.innerHTML = `
            <p>${index === 0 ? 'Today' : new Date(day.datetime).toLocaleDateString('en-US', { weekday: 'short' })}</p>
            <div class="icon"><img src="${getIcon(day.icon)}" alt="${day.icon}"></div>
            <p class="temp-click" data-index="${index}">${Math.round(day.temp)}°C</p>
            <p class="low-temp">${Math.round(day.tempmin)}°C</p>
        `;

        //  Оновлює головну панель з погодою на вибраний день
        forecastDay.addEventListener('click', () => {
            updateMainWeather({ resolvedAddress: `${cityElem.textContent}, ${countryElem.textContent}` }, index);
        });

        //  Клік по температурі відкриває попап з деталями дня
        forecastDay.querySelector('.temp-click').addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = e.target.dataset.index;
            showPopup(forecastData[idx]);
        });

        forecastCarousel.appendChild(forecastDay);
    });
}

function getIcon(condition) {
    const icons = {
        'clear-day': 'sunny.png',
        'rain': 'rainy.png',
        'cloudy': 'cloudy.png',
        'partly-cloudy-day': 'cloudy.png',
        'snow': 'snow.png',
        'fog': 'fog.png',
        'wind': 'windy.png'
    };
    return icons[condition] || 'sunny.png';
}

//  Відображення попапу з деталями про день
function showPopup(day) {
    popup.innerHTML = `
        <div class="popup-content">
            <h3>Details for ${day.datetime}</h3>
            <p>Conditions: ${day.conditions}</p>
            <p>Max Temp: ${day.tempmax}°C</p>
            <p>Min Temp: ${day.tempmin}°C</p>
            <p>Humidity: ${day.humidity}%</p>
            <p>Wind: ${day.windspeed} km/h</p>
            <p>UV Index: ${day.uvindex}</p>
            <button class="popup-content-btn" onclick="document.querySelector('.popup').style.display='none'">Close</button>
        </div>
    `;
    popup.style.display = 'block';
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});

cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
        const city = cityInput.value.trim();
        if (city) fetchWeather(city);
    }
});

// Load default city
fetchWeather('Kyiv');