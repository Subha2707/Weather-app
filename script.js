const apiKey = "56a100731ec5b5f7baf2a6dfbd2adace";

const temp = document.getElementById("temp");
const locationEl = document.getElementById("location");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feels = document.getElementById("feels");
const forecastContainer = document.getElementById("forecast");
const animationDiv = document.getElementById("animation");

// Dark mode
document.getElementById("darkModeToggle").onclick = () => {
    document.body.classList.toggle("dark");
};

// Auto location
navigator.geolocation.getCurrentPosition(pos => {
    loadWeather(pos.coords.latitude, pos.coords.longitude);
}, () => {
    alert("Location permission denied");
});

// Search
function searchCity() {
    const city = document.getElementById("cityInput").value;

    if (!city) return;

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
        if (data.cod !== 200) {
            alert("City not found ❌");
            return;
        }
        loadWeather(data.coord.lat, data.coord.lon);
    });
}

// Load all data
function loadWeather(lat, lon) {
    getWeather(lat, lon);
    getForecast(lat, lon);
}

// Current weather
function getWeather(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
        locationEl.textContent = data.name;
        temp.textContent = Math.round(data.main.temp) + "°C";
        condition.textContent = data.weather[0].main;

        humidity.textContent = data.main.humidity + "%";
        wind.textContent = data.wind.speed + "km/h";
        feels.textContent = Math.round(data.main.feels_like) + "°C";

        setBackground(data.weather[0].main);
        animateWeather(data.weather[0].main);
    });
}

// Background
function setBackground(weather) {
    if (weather.includes("Rain")) {
        document.body.style.background = "#4e54c8";
    } else if (weather.includes("Clear")) {
        document.body.style.background = "#f7971e";
    } else if (weather.includes("Cloud")) {
        document.body.style.background = "#757f9a";
    } else if (weather.includes("Snow")) {
        document.body.style.background = "#e6dada";
    }
}

// Animation
function animateWeather(weather) {
    animationDiv.innerHTML = "";

    if (!weather.includes("Rain") && !weather.includes("Snow")) return;

    for (let i = 0; i < 40; i++) {
        let el = document.createElement("div");
        el.className = weather.includes("Rain") ? "rain" : "snow";

        el.style.left = Math.random() * 100 + "vw";
        el.style.animationDuration = (Math.random() * 1 + 0.5) + "s";

        animationDiv.appendChild(el);
    }
}

// Forecast 
function getForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {

        forecastContainer.innerHTML = "";

        let temps = [];
        let labels = [];

        for (let i = 0; i < 7; i++) {

            let index = i * 8;

            if(!data.list[index]) break;

            let item = data.list[index];
            let date = new Date(item.dt_txt);

            let div = document.createElement("div");
            div.className = "forecast-item";

            div.innerHTML = `
                <p>${date.toLocaleDateString(undefined, {weekday: 'short'})}</p>
                <p>${Math.round(item.main.temp)}°C</p>
                <p>${item.weather[0].main}</p>
            `;

            forecastContainer.appendChild(div);
        }

        for (let i = 0; i < 8; i++) {
            temps.push(data.list[i].main.temp);
            labels.push(new Date(data.list[i].dt_txt).getHours() + ":00");
        }

        drawChart(labels, temps);
        console.log(temps, labels);
    });
    
}

// Better graph
function drawChart(labels, temps) {
    const canvas = document.getElementById("hourlyChart");
    const ctx = canvas.getContext("2d");

    canvas.width = 350;
    canvas.height = 180;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Safety check
    if (!temps || temps.length === 0) return;

    let max = Math.max(...temps);
    let min = Math.min(...temps);

    if (max === min) max += 1;

    
    ctx.strokeStyle = "#ff4d4d"; 
    ctx.lineWidth = 3;
    ctx.fillStyle = "#000";
    ctx.font = "12px Poppins";

    ctx.beginPath();

    temps.forEach((t, i) => {
        let x = i * 40 + 30;
        let y = 140 - ((t - min) / (max - min)) * 100;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();

    temps.forEach((t, i) => {
        let x = i * 40 + 30;
        let y = 140 - ((t - min) / (max - min)) * 100;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#007bff";
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.fillText(Math.round(t) + "°", x - 10, y - 12);

        ctx.fillText(labels[i], x - 12, 165);
    });
}