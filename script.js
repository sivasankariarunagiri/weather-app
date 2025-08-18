const cityInput = document.getElementById("cityInput");
const suggestionsBox = document.getElementById("suggestions");
const searchBtn = document.getElementById("searchBtn");

const tempEl = document.getElementById("temp");
const cityNameEl = document.getElementById("cityName");
const conditionEl = document.getElementById("condition");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const historyTable = document.querySelector("#historyTable tbody");


const WEATHER_API_KEY = "f3c0fd13d9mshde4d17f57daf5f6p13112cjsn5b0ecdfc2682";
const GEODB_API_KEY = "f3c0fd13d9mshde4d17f57daf5f6p13112cjsn5b0ecdfc2682";


cityInput.addEventListener("input", () => {
  const query = cityInput.value.trim();
  if (query.length < 2) {
    suggestionsBox.style.display = "none";
    return;
  }

  fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}`, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "f3c0fd13d9mshde4d17f57daf5f6p13112cjsn5b0ecdfc2682",
      "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
    }
  })
    .then(res => res.json())
    .then(data => {
      suggestionsBox.innerHTML = "";
      data.data.forEach(city => {
        const div = document.createElement("div");
        div.textContent = `${city.city}, ${city.country}`;
        div.addEventListener("click", () => {
          cityInput.value = city.city;
          suggestionsBox.style.display = "none";
        });
        suggestionsBox.appendChild(div);
      });
      suggestionsBox.style.display = "block";
    })
    .catch(err => console.error(err));
});


searchBtn.addEventListener("click", fetchWeather);
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    fetchWeather();
  }
});


function fetchWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  
  fetch(`https://weatherapi-com.p.rapidapi.com/current.json?q=${city}`, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": WEATHER_API_KEY,
      "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com"
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("City not found");
        return;
      }

      tempEl.textContent = `${data.current.temp_c}°C`;
      cityNameEl.textContent = data.location.name;
      conditionEl.textContent = data.current.condition.text;
      humidityEl.textContent = `${data.current.humidity}%`;
      windEl.textContent = `${data.current.wind_kph} km/h`;

      fetchHistory(city);
    })
    .catch(err => console.error(err));
}


function fetchHistory(city) {
  const today = new Date();

  historyTable.innerHTML = "";

  for (let i = 1; i <= 10; i++) {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - i);
    const dateStr = pastDate.toISOString().split("T")[0];

    fetch(`https://weatherapi-com.p.rapidapi.com/history.json?q=${city}&dt=${dateStr}`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": WEATHER_API_KEY,
        "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com"
      }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          const row = `<tr>
            <td>${dateStr}</td>
            <td>${data.forecast.forecastday[0].day.avgtemp_c}°C</td>
            <td>${data.forecast.forecastday[0].day.condition.text}</td>
          </tr>`;
          historyTable.innerHTML += row;
        }
      })
      .catch(err => console.error(err));
  }
}
