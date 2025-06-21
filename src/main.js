let daysData = [] 
let currentCity
let currentAddress
let isFirstLoad = true

async function loadWeather(city) {
    const apiKey = '42X3PN2U3BCYZV8FFRWCV3UVA'
    const resp = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&key=${apiKey}&contentType=json`)
    if (!resp.ok) {
        alert('City not found')
        return
    }
    const data = await resp.json()
    daysData = data.days.slice(0, 10)

    currentCity = data.address
    currentAddress = data.resolvedAddress
    
    isFirstLoad = true
    updateDetailedInfo(0)
    renderCarousel()
    console.log(data)
}

function updateDetailedInfo(index) {
    const detailedCity = document.querySelector('.detailed-city')
    const detailedCountry = document.querySelector('.detailed-country')
    const detailedTemp = document.querySelector('.detailed-temp')
    const detailedDesc = document.querySelector('.detailed-desc')
    const windElem = document.querySelector('.wind')
    const humidityElem = document.querySelector('.humidity')
    const detailedIcon = document.querySelector('.detailed-icon')
    
    const day = daysData[index]
    detailedCity.textContent = currentCity
    detailedCountry.textContent = currentAddress
    detailedTemp.textContent = Math.round(day.temp) + '°C'
    detailedDesc.textContent = day.conditions
    windElem.textContent = Math.round(day.windspeed) + 'km/h'
    humidityElem.textContent = day.humidity + '%'
    createDetailedIconByConditions(day.icon, detailedIcon)
    setUpPopupListener(index)
}

function renderCarousel() {
    const carousel = document.querySelector('.carousel')
    carousel.innerHTML = ''
    daysData.forEach((day, index) => {
        const li = document.createElement('li')
        li.className = 'carousel-item'
        
        const title = document.createElement('h5')
        title.className = 'carousel-title'
        title.textContent = `${index === 0 ? 'Today' : new Date(day.datetime).toLocaleDateString('en-EN', { weekday: 'short' })}`

        const dateStr = day.datetime
        const date = new Date(dateStr)

        const formatted = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short'})

        const subTitle = document.createElement('span')
        subTitle.className = 'carousel-subtitle'
        subTitle.textContent = formatted

        
        const icon = document.createElement('picture')
        icon.className = 'carousel-icon'

        let currentPicture = ''
        if (day.icon.includes('rain')) currentPicture = 'rain'
        if (day.icon.includes('cloud')) currentPicture = 'cloudy'
        if (day.icon.includes('clear')) currentPicture = 'sun'

        const source = document.createElement('source')
        source.setAttribute('srcset', `./img/${currentPicture}Bigger.png`)
        source.setAttribute('media', '(min-width: 600px)')

        const img = document.createElement('img')
        img.setAttribute('src', `./img/${currentPicture}.png`)

        icon.append(source, img)
         
        const maxTemperature = document.createElement('span')
        maxTemperature.className = 'max-temp'
        maxTemperature.textContent = Math.round(day.tempmax) + '°C'

        const minTemperature = document.createElement('span')
        minTemperature.className = 'min-temp'
        minTemperature.textContent = Math.round(day.tempmin) + '°C'

        li.append(title, subTitle, icon, maxTemperature, minTemperature)

        li.addEventListener('click', () => {
            updateDetailedInfo(index)
            document.querySelectorAll('.carousel-item').forEach(item => { item.classList.remove('current')})
            li.classList.add('current')
        })

        carousel.appendChild(li)
    })

    if (isFirstLoad) {
        const firstItem = carousel.querySelector('.carousel-item')
        if (firstItem) {
            firstItem.classList.add('current')
        }
        isFirstLoad = false
    }
}

function createDetailedIconByConditions(icon, detailedIcon) {
    let currentPicture = ''
    if (icon.includes('rain')) currentPicture = 'rain'
    if (icon.includes('cloud')) currentPicture = 'cloudy'
    if (icon.includes('clear')) currentPicture = 'sun'

    detailedIcon.innerHTML =''
    
    const sourceOne = document.createElement('source')
    sourceOne.setAttribute('srcset', `./img/${currentPicture}Biggest.png`)
    sourceOne.setAttribute('media', '(min-width: 600px)')

    const sourceTwo = document.createElement('source')
    sourceTwo.setAttribute('srcset', `./img/${currentPicture}Bigger.png`)

    const img = document.createElement('img')
    img.setAttribute('src', `./img/${currentPicture}.png`)

    detailedIcon.append(sourceOne, sourceTwo, img)
}

const searchInput = document.querySelector('.search-input')
const searchButton = document.querySelector('.search-button')
searchButton.addEventListener('click', () => {
    const value = searchInput.value.trim();
    if (value !== '') {
        loadWeather(value)
        searchInput.value = '';
    } else {
        searchInput.focus();
    }
})
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchButton.click();
    }
})

function setUpPopupListener(index) {
    const detailedTemp = document.querySelector('.detailed-temp')
    let popup = document.querySelector(".popup")
    let closePopupButton = document.querySelector(".popup-close")
    let popupContent = document.querySelector(".popup-content")

    detailedTemp.addEventListener('click', () => {
        popup.classList.add('popup-active')
        popupContent.classList.add('popup-content-active')
        setUpPopupContent(index)
    })

    closePopupButton.addEventListener('click', () => {
        popup.classList.remove('popup-active')
        popupContent.classList.remove('popup-content-active')
    })
}

function setUpPopupContent(index) {
    const popupCity = document.querySelector('.popup-city')
    const popupDate = document.querySelector('.popup-date')
    const popupDescription = document.querySelector('.popup-description')
    const popupMaxTemp = document.querySelector('.max-real')
    const popupMinTemp = document.querySelector('.min-real')
    const popupMaxFeel = document.querySelector('.max-feels')
    const popupMinFeel = document.querySelector('.min-feels')
    const popupSunrise = document.querySelector('.sunrise')
    const popupSunset = document.querySelector('.sunset')
    const popupVisibility = document.querySelector('.visibility')
    const popupPressure = document.querySelector('.pressure')

    const day = daysData[index]

    popupCity.textContent = currentAddress
    const dateStr = day.datetime
    const date = new Date(dateStr)

    const formatted = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    popupDate.textContent = formatted
    popupDescription.textContent = day.description
    popupMaxTemp.textContent = Math.round(day.tempmax) + '°C'
    popupMinTemp.textContent = Math.round(day.tempmin) + '°C'
    popupMaxFeel.textContent = Math.round(day.feelslikemax) + '°C'
    popupMinFeel.textContent = Math.round(day.feelslikemin) + '°C'
    const time = day.sunrise
    const [hours, minutes] = time.split(":")
    const shortTime = `${hours}:${minutes}`
    popupSunrise.textContent = shortTime

    const timeTwo = day.sunset
    const [hoursTwo, minutesTwo] = timeTwo.split(":")
    const shortTimeTwo = `${hoursTwo}:${minutesTwo}`
    popupSunset.textContent = shortTimeTwo

    popupVisibility.textContent = day.visibility + 'km'
    popupPressure.textContent = day.pressure + 'hPa'
}

loadWeather('Kyiv')