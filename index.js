let denovi = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let lokacijaIcon = `<svg class="lokacija_icon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 48c-79.5 0-144 61.39-144 137c0 87 96 224.87 131.25 272.49a15.77 15.77 0 0 0 25.5 0C304 409.89 400 272.07 400 185c0-75.61-64.5-137-144-137"/><circle cx="256" cy="192" r="48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>`

let bg = {
    "night": "linear-gradient(to top, rgba(37,99,235, 0.6), rgba(217,70,239,0.6)), url(\"https://i.pinimg.com/736x/5b/8c/7c/5b8c7c8340c299df836144a6eecccb65.jpg\")",
    "day": "linear-gradient(to top, rgba(16,185,129, 0.6), rgba(34,211,238,0.6)), url(\"https://i.pinimg.com/736x/83/7d/ee/837dee0a8fd66c236fab37ffee2a8b8e.jpg\")",
    "rainy": "linear-gradient(to top, rgba(16,185,129, 0.6), rgba(34,211,238,0.6)), url(\"https://i.pinimg.com/736x/a9/87/72/a98772846d7cb84b02e01048d5003eae.jpg\")",
    "snowy": "linear-gradient(to top, rgba(165,180,252, 0.6), rgba(103,232,249,0.6)), url(\"https://i.pinimg.com/736x/57/bb/66/57bb66340f4dd3b367431f8c9d379bcf.jpg\")",
    "cloudy": "linear-gradient(to top, rgba(165,180,252, 0.6), rgba(103,232,249,0.6)), url(\"https://i.pinimg.com/736x/ad/0f/af/ad0fafb892f2ec61c96235bdbe9f4cc7.jpg\")",
    "thunder": "linear-gradient(to top, rgba(37,99,235, 0.6), rgba(217,70,239,0.6)), url(\"https://i.pinimg.com/736x/ea/1b/07/ea1b07dffe6b7e82d9966b113f47733f.jpg\")"
}


async function fetchInfo(q) {
    let response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=418a365941db42a580b172033241403&q=${q}&days=4&aqi=no&alerts=no`)
    if (!response.ok) return;

    let data = await response.json();
    return data
}

function getBg(text) {
    if(text.toLowerCase().includes("sunny")) return bg["day"]
    if(text.toLowerCase().includes("clear")) return bg["night"]
    if(text.toLowerCase().includes("cloud")) return bg["cloudy"]
    if(text.toLowerCase().includes("rain")) return bg["rainy"]
    if(text.toLowerCase().includes("snow")) return bg["snowy"]
    if(text.toLowerCase().includes("thunder")) return bg["thunder"]
    return bg["day"]
}

function displayData(data) {
    document.querySelector(".den").innerText = denovi[new Date().getDay()];
    document.querySelector(".datum").innerText = `${new Date().getDate()} ${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`
    document.querySelector(".lokacija_main").innerHTML = `${lokacijaIcon} ${data.location.name}, ${data.location.country}`
    document.querySelector(".glaven_icon").src = `https:${data.current.condition.icon}`
    document.querySelector(".temperatura").innerHTML = `${data.current.temp_c}°C`
    document.querySelector(".vreme_text").innerHTML = `${data.current.condition.text}`
    
    document.querySelector("#main").style.backgroundImage = getBg(data.current.condition.text)

    document.querySelector("#pritisok").innerHTML = `${data.current.pressure_mb} hPa`
    document.querySelector("#vlaznost").innerHTML = `${data.current.humidity} %`
    document.querySelector("#vetar").innerHTML = `${data.current.wind_kph} km/h`
    document.querySelector("#direkcija").innerHTML = `${data.current.wind_degree}°`

    let astro = data.forecast.forecastday[0].astro
    document.querySelector("#sunrise").innerHTML = `${astro.sunrise}`
    document.querySelector("#sunset").innerHTML = `${astro.sunset}`

    //caluclate the sunset and the current time and apply margin to element with class .sredina_sonce from 0 to 90%
    let sredina_sonce = document.querySelector(".sredina_sonce");
    calculateSunPosition(data.location.localtime, astro.sunrise, astro.sunset, sredina_sonce);

    let forecastItems = document.querySelectorAll(".idno_vreme")
    let i = 0;
    for(let item of forecastItems) {
        item.querySelector("img").src = `https:${data.forecast.forecastday[i].day.condition.icon}`
        item.querySelector("h3").innerText = `${denovi[new Date(data.forecast.forecastday[i].date).getDay()].slice(0,3)}`
        item.querySelector("h4").innerText = `${parseInt(data.forecast.forecastday[i].day.avgtemp_c)}°C`
        i++;
    }

}

function calculateSunPosition(localTime, sunriseTime, sunsetTime, element) {
    const now = new Date(localTime);
    const sunrise = new Date(`${now.toDateString()} ${sunriseTime}`);
    const sunset = new Date(`${now.toDateString()} ${sunsetTime}`);
    const totalDayLength = sunset - sunrise;
    const elapsedTime = now - sunrise;
    const percentage = (elapsedTime / totalDayLength) * 100;
  
    const marginLeft = Math.min(90, percentage) + '%';
    element.style.marginLeft = marginLeft;
  }
  

function displayLocations(){
    let button = `<button class="new_lokacija"><svg class="icona" viewBox="0 0 256 256"><path fill="currentColor" d="M228 128a12 12 0 0 1-12 12h-76v76a12 12 0 0 1-24 0v-76H40a12 12 0 0 1 0-24h76V40a12 12 0 0 1 24 0v76h76a12 12 0 0 1 12 12"/></svg></button>`

    let lokacii = localStorage.getItem("lokacii");
    console.log(lokacii)
    try{lokacii = JSON.parse(lokacii)}catch(err){console.log(err),lokacii = []}
    console.log(lokacii)
    if(!Array.isArray(lokacii)) lokacii = [];

    //dobivame url od window
    let url = new URL(window.location);
    //dobivame selektirana lokacija so parametar q
    let selectedLokacija = url.searchParams.get("q");
    //ako ne postoi parametar togas stavame parametar od pravata zacuvana lokacija ili prilep
    if(!selectedLokacija) window.location.search = `?q=${encodeURI(lokacii[0] || "Prilep, Macedonia")}`;


    let container = document.querySelector(".lokacii_container");
    container.innerHTML = `${lokacii.map((lokacija) => `<a href=${`?q=${encodeURI(lokacija)}`} class="lokacija ${selectedLokacija === lokacija ? "active" : ""}"><h4>${lokacija}</h4></a>`).join("\n")} ${button}`;
}
async function main() {
    displayLocations();

    let data = await fetchInfo(new URL(window.location).searchParams.get("q"));
    console.log(data);

    displayData(data);

    document.querySelector("button.new_lokacija").addEventListener("click", () => {
        let dialog = document.querySelector("dialog");
        dialog.style.display = "flex";
        dialog.showModal();
    })
    document.querySelector("button.secondary").addEventListener("click", () => {
        let dialog = document.querySelector("dialog");
        dialog.style.display = "none";
        dialog.close();
    })

    document.querySelector("dialog > div > button[type=submit]").addEventListener("click", async () => {
        let lokacija = document.querySelector("dialog > input").value;
        let data = await fetchInfo(lokacija)
        if(!data) return;

        let lokacii = localStorage.getItem("lokacii");
        try{lokacii = JSON.parse(lokacii)}catch(err){console.log(err),lokacii = []}
        lokacii.push(`${data.location.name}, ${data.location.country}`);
        localStorage.setItem("lokacii", JSON.stringify(lokacii));

        window.location.search = `?q=${encodeURI(lokacii.at(-1))}`

        displayData(data);
        displayLocations();

        let dialog = document.querySelector("dialog");
        dialog.style.display = "none";
        dialog.close();
    })
}
main();