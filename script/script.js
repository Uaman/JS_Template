const API_KEY = 'QHY9C2NBDLL3W9QNTQE8FKK9L';
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

let cityName, country, temperature, description, wind, humidity, windDesktop, humidityDesktop, forecastCarousel;

let currentCity = 'Kyiv';

let currentWeatherData = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();

    getWeatherData(currentCity);

    const cityInput = document.getElementById('cityInput');
    if (cityInput) {
        cityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCity();
            }
        });
    }

    if (temperature) {
        temperature.addEventListener('click', () => {
            const activeCard = document.querySelector('.forecast-card.active');
            const dayIndex = activeCard ? parseInt(activeCard.dataset.index) : 0;

            showDetailedPopup(dayIndex);
        });
    }
});

function initializeDOMElements() {
    cityName = document.getElementById('cityName');
    country = document.getElementById('country');
    temperature = document.getElementById('temperature');
    description = document.getElementById('description');
    wind = document.getElementById('wind');
    humidity = document.getElementById('humidity');
    windDesktop = document.getElementById('wind-desktop');
    humidityDesktop = document.getElementById('humidity-desktop');
    forecastCarousel = document.getElementById('forecastCarousel');

    if (!cityName || !country || !temperature || !description || !wind || !humidity || !windDesktop || !humidityDesktop || !forecastCarousel) {
        console.error('Не всі DOM елементи знайдено');
    }
}

function searchCity() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();

    if (city) {
        getWeatherData(city);
        cityInput.value = '';
    }
}

async function getWeatherData(city) {
    try {
        const url = `${BASE_URL}/${encodeURIComponent(city)}?unitGroup=metric&include=days&key=${API_KEY}&contentType=json`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        currentWeatherData = data;
        updateWeatherUI(data);
        updateForecast(data);
        saveWeatherDataToLocalStorage(data);
        return data;
    } catch (error) {
        console.error('Помилка при отриманні даних про погоду:', error);
        if (error.message.includes('status: 400')) {
            alert('Такого міста не знайдено!');
        } else {
            alert(`Помилка при отриманні даних про погоду: ${error.message}`);
        }
    }
}

function saveWeatherDataToLocalStorage(data) {
    if (!data || !data.days || !data.days[0]) return;

    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    const todayData = data.days[0];
    const city = capitalizeFirstLetter(data.address);

    const reportData = {
        "Місто": city,
        "Дата": todayData.datetime,
        "Температура": todayData.temp,
        "Мін. темп.": todayData.tempmin,
        "Макс. темп.": todayData.tempmax,
        "Відчувається як": todayData.feelslike,
        "Вітер (km/h)": todayData.windspeed,
        "Вологість (%)": todayData.humidity,
        "Тиск (mb)": todayData.pressure
    };

    const cityIndex = history.findIndex(item => item["Місто"] === city);
    if (cityIndex > -1) {
        history[cityIndex] = reportData;
    } else {
        history.push(reportData);
    }
    localStorage.setItem('weatherHistory', JSON.stringify(history));
}

function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateWeatherUI(data) {
    if (!data || !data.days || !data.days[0]) {
        return;
    }
    const day = data.days[0];
    if (cityName) cityName.textContent = capitalizeFirstLetter(data.address);
    if (country) country.textContent = data.resolvedAddress || '';
    if (temperature) temperature.textContent = `${Math.round(day.temp)}°C`;
    if (description) description.textContent = day.conditions;
    if (wind) wind.textContent = `${day.windspeed} km/h`;
    if (humidity) humidity.textContent = `${day.humidity}%`;
    if (windDesktop) windDesktop.textContent = `${day.windspeed} km/h`;
    if (humidityDesktop) humidityDesktop.textContent = `${day.humidity}%`;
    updateWeatherIcon(day.icon);
}

function updateForecast(data) {
    if (!forecastCarousel) {
        return;
    }
    if (!data || !data.days) {
        return;
    }
    forecastCarousel.innerHTML = '';
    const daysToShow = Math.min(data.days.length, 10);
    for (let i = 0; i < daysToShow; i++) {
        const day = data.days[i];
        const date = new Date(day.datetime);
        const dayName = i === 0 ? 'Today' : getDayName(date);
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.dataset.index = i;
        card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">
                ${getWeatherIconHTML(day.icon)}
            </div>
            <div class="forecast-temps">
                <span class="high-temp">${Math.round(day.tempmax)}°C</span>
                <span class="low-temp">${Math.round(day.tempmin)}°C</span>
            </div>
        `;
        card.addEventListener('click', () => {
            showDayDetails(i);
        });
        forecastCarousel.appendChild(card);
    }
    if (forecastCarousel.children.length > 0) {
        forecastCarousel.children[0].classList.add('active');
    }
}

function getDayName(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
}

function updateWeatherIcon(iconCode) {
    const mainWeatherIcon = document.querySelector('.main-weather-icon');
    if (mainWeatherIcon) {
        mainWeatherIcon.innerHTML = getWeatherIconHTML(iconCode);
    }
}

function getWeatherIconHTML(iconCode) {
    if (iconCode === 'clear-day' || iconCode === 'clear-night') {
        return `
            <div class="sun-rays">
                <div class="ray"></div>
                <div class="ray"></div>
                <div class="ray"></div>
                <div class="ray"></div>
                <div class="ray"></div>
                <div class="ray"></div>
                <div class="ray"></div>
                <div class="ray"></div>
            </div>
            <div class="sun-icon"></div>
        `;
    } else if (iconCode === 'rain' || iconCode === 'showers') {
        return `
            <div class="cloud-icon"></div>
            <div class="rain-drops">
                <div class="drop"></div>
                <div class="drop"></div>
                <div class="drop"></div>
            </div>
        `;
    } else if (iconCode === 'partly-cloudy-day' || iconCode === 'partly-cloudy-night' || iconCode === 'cloudy') {
        return `<div class="cloud-icon"></div>`;
    } else {
        return `
            <div class="sun-rays">
                <div class="ray"></div>
                <div class="ray"></div>
                <div class="ray"></div>
                <div class="ray"></div>
                <div class="ray"></div>
                <div class="ray"></div>
                <div class="ray"></div>
                <div class="ray"></div>
            </div>
            <div class="sun-icon"></div>
        `;
    }
}

function showDayDetails(dayIndex) {
    if (!currentWeatherData || !currentWeatherData.days[dayIndex]) return;

    const day = currentWeatherData.days[dayIndex];

    if (temperature) temperature.textContent = `${Math.round(day.temp)}°C`;
    if (description) description.textContent = day.conditions;
    if (wind) wind.textContent = `${day.windspeed} km/h`;
    if (humidity) humidity.textContent = `${day.humidity}%`;
    if (windDesktop) windDesktop.textContent = `${day.windspeed} km/h`;
    if (humidityDesktop) humidityDesktop.textContent = `${day.humidity}%`;

    updateWeatherIcon(day.icon);

    const cards = document.querySelectorAll('.forecast-card');
    cards.forEach(card => card.classList.remove('active'));
    if (cards[dayIndex]) {
        cards[dayIndex].classList.add('active');
    }
}

function showDetailedPopup(dayIndex) {
    if (!currentWeatherData || !currentWeatherData.days[dayIndex]) return;

    const day = currentWeatherData.days[dayIndex];
    const date = new Date(day.datetime);
    const dayName = dayIndex === 0 ? 'Today' : getDayName(date);
    const fullDate = date.toLocaleDateString('uk-UA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const popup = document.createElement('div');
    popup.className = 'weather-popup';

    popup.innerHTML = `
        <div class="popup-content">
            <span class="close-popup">&times;</span>
            <h2>${dayName}, ${fullDate}</h2>
            <div class="popup-weather-icon">
                ${getWeatherIconHTML(day.icon)}
            </div>
            <div class="popup-temperature">
                <span class="popup-temp">${Math.round(day.temp)}°C</span>
                <span class="popup-feels-like">Відчувається як: ${Math.round(day.feelslike)}°C</span>
            </div>
            <div class="popup-conditions">${day.conditions}</div>
            <div class="popup-details">
                <div class="popup-detail">
                    <span class="detail-label">Мін. температура:</span>
                    <span class="detail-value">${Math.round(day.tempmin)}°C</span>
                </div>
                <div class="popup-detail">
                    <span class="detail-label">Макс. температура:</span>
                    <span class="detail-value">${Math.round(day.tempmax)}°C</span>
                </div>
                <div class="popup-detail">
                    <span class="detail-label">Вітер:</span>
                    <span class="detail-value">${day.windspeed} km/h</span>
                </div>
                <div class="popup-detail">
                    <span class="detail-label">Вологість:</span>
                    <span class="detail-value">${day.humidity}%</span>
                </div>
                <div class="popup-detail">
                    <span class="detail-label">Схід сонця:</span>
                    <span class="detail-value">${day.sunrise}</span>
                </div>
                <div class="popup-detail">
                    <span class="detail-label">Захід сонця:</span>
                    <span class="detail-value">${day.sunset}</span>
                </div>
                <div class="popup-detail">
                    <span class="detail-label">УФ-індекс:</span>
                    <span class="detail-value">${day.uvindex}</span>
                </div>
                <div class="popup-detail">
                    <span class="detail-label">Опади:</span>
                    <span class="detail-value">${day.precip} mm</span>
                </div>
                <div class="popup-detail">
                    <span class="detail-label">Тиск:</span>
                    <span class="detail-value">${day.pressure} mb</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    const closeBtn = popup.querySelector('.close-popup');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(popup);
    });

    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
}