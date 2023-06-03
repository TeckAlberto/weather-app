const countries = document.querySelector('#countries');
const cities = document.querySelector('#cities');
const main = document.querySelector('#main');

const weatherInfo = document.querySelector('#weather-info');

const form = document.querySelector('form');

const kelvinToCentigrade = degrees => parseInt(degrees - 273.15);

const weathers = {
    'Clear' : 'despejado',
    'Clouds' : 'nublado',
    'Rain' : 'lluvioso',
    'Drizzle' : 'llovizna',
    'Thunderstorm' : 'tormenta',
    'Snow' : 'nevado',
    'Mist' : 'neblina',
    'Fog' : 'niebla',
    'Haze' : 'bruma',
    'Smoke' : 'humeado',
    'Dust' : 'polveado',
    'Sand' : 'arenoso',
    'Ash' : 'ceniza',
    'Squall' : 'chubasco',
    'Tornado' : 'tornado',
}


// Datos de API's
// ---- openweather ----
let keyOW;

// ---- timezonedb ----
let keyTM;

// ---- geonames ----
let userGN;

// EVENTOS
document.addEventListener('DOMContentLoaded', () => {

    async function getData() {
        try {
            const response = await fetch('../config.json');
            const data = await response.json();

            keyOW = data.openweather.key;
            keyTM = data.timezonedb.key;
            userGN = data.geoname.userName;

            return userGN;

        } catch (error) {
            console.log('Error:', error);
        }
    }

    getData()
        .then(userGN => {
            // console.log(userGN);

            fetch(`http://api.geonames.org/countryInfoJSON?username=${userGN}`)
                .then(response => response.json())
                .then(data => {
                    data.geonames.forEach(country => {
                        const option = document.createElement('option');
                        option.value = country.countryName;
                        option.text = country.countryName;
                        option.id = country.countryCode;
                        countries.appendChild(option);
                    });
                })
                .catch(error => {
                    console.log('Error:', error);
                });
        });
});



form.addEventListener('submit', showWeather);

countries.addEventListener('change', showCities);






// FUNCIONES
function showWeather(event) {
    event.preventDefault();
    //weatherInfo.classList.remove('hidden');
    const country = countries.options[countries.selectedIndex].id;
    const city = cities.options[cities.selectedIndex].value;

    if(country === '' || city === '') {
        // Error
        showError('Ambos campos son obligatorios');
    }

     //Consultar API
     queryAPI(country, city);
}


function showCities () {
  
    // Limpia las opciones existentes
    cities.innerHTML = '';
    const country = this.options[this.selectedIndex].id;
  
    // Obtiene las ciudades del país seleccionado utilizando la API de Geonames
    fetch(`http://api.geonames.org/searchJSON?country=${country}&username=${userGN}`)
      .then(response => response.json())
      .then(data => {
        //console.log(country);
        const citiesGeo = data.geonames.map(city => city.name);
        //console.log(cities)

        const uniqueCities = citiesGeo.filter((value, index, self) => {
            return self.indexOf(value) === index;
          });

        const sortedCities = uniqueCities.sort((a, b) => a.localeCompare(b));
        //console.log(sortedCities)

        // Recorre la lista de ciudades y agrega opciones al elemento select
        sortedCities.forEach(city => {
            //console.log(city.name);
            const option = document.createElement('option');
            option.value =city;
            option.text =city;
            cities.appendChild(option);
        });
      })
      .catch(error => {
        console.log('Error:', error);
      });
}


function queryAPI(country, city) {
    //console.log(`Pais: ${country} y Ciudad: ${city}`);

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${keyOW}`;

    fetch(url)
    .then( response => response.json() )
    .then( data => {

        //limpiarHTML();

        if(data.cod === "404") {
            showError('Ciudad no encontrada');
            return;
        }
        //console.log(data);
        // Imprime la respuesta en el HTML
        showData(data);
    });

}


function showError( mensaje ) {
    const alerta = document.querySelector('.bg-red-100');

    if(!alerta) {
        const alerta = document.createElement('div');

        alerta.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'px-4', 'py-3', 'rounded', 'max-w-md', 'mx-auto', 'mt-6', 'text-center');

        alerta.innerHTML = `
            <strong class="font-bold">Error!</strong>
            <span class="block">${mensaje}</span>
        
        `;

        main.appendChild(alerta);
        // Se elimine la alerta despues de 5 segundos
        setTimeout(() => {
            alerta.remove();
        }, 5000);
    }

    
}


function showData(data) {

    cleanHTML();
    // console.log('Nombre: ', data.name)

    const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${keyTM}&format=json&by=position&lat=${data.coord.lat}&lng=${data.coord.lon}`;

    // console.log(url);

    fetch(url)
        .then(response => response.json() )
        .then(result => {
            const dateTime = result.formatted; // Fecha y hora completa en formato de cadena
            const time = dateTime.split(' ')[1]; // Extraer la segunda parte de la cadena, que es la hora
        })


    const main = document.createElement('div');
    main.classList.add('p-2', 'flex', 'md:justify-center', 'w-full', 'flex-col', 'space-y-5');


    const tempGroup = document.createElement('div');
    tempGroup.classList.add('text-white', 'font-bold', 'sm:flex', 'sm:justify-between', 'sm:items-center', 'p-2', 'w-full', 'space-y-4', 'md:space-y-0');

    const tempMin = document.createElement('p');
    tempMin.innerHTML = `Temperatura minima: <br><span class="font-normal">${kelvinToCentigrade(data.main.temp_min)} &#8451</span>`;
    tempMin.classList.add('text-2xl', 'text-white', 'text-center', 'font-bold')
    const tempMed = document.createElement('p');
    tempMed.innerHTML = `Temperatura actual: <br><span class="font-normal">${kelvinToCentigrade(data.main.temp)} &#8451</span>`;
    tempMed.classList.add('text-4xl', 'text-white', 'text-center', 'font-bold', 'py-3')
    const tempMax = document.createElement('p');
    tempMax.innerHTML = `Temperatura maxima: <br><span class="font-normal">${kelvinToCentigrade(data.main.temp_max)} &#8451</span>`; 
    tempMax.classList.add('text-2xl', 'text-white', 'text-center', 'font-bold')

    tempGroup.appendChild(tempMin)
    tempGroup.appendChild(tempMed)
    tempGroup.appendChild(tempMax)

    const nameCountry = document.createElement('h3');
    nameCountry.classList.add('text-5xl', 'text-white', 'text-center', 'font-bold', 'my-3')
    nameCountry.textContent = data.name;

    const climate = document.createElement('p');
    climate.innerHTML = `Clima: <br><span class="font-normal">${weathers[data.weather[0].main]}</span>`; 
    climate.classList.add('text-2xl', 'text-white', 'text-center', 'font-bold')

    const wind = document.createElement('p');
    wind.innerHTML = `Velocidad del viento: <br><span class="font-normal">${data.wind.speed}</span>`
    wind.classList.add('text-2xl', 'text-white', 'text-center', 'font-bold');

    main.appendChild(nameCountry);
    main.appendChild(tempGroup);
    main.appendChild(climate);
    main.appendChild(wind);



    



    // weatherInfo.innerHTML = data.name;

    weatherInfo.appendChild(main);

    // console.log(data.weather[0].main);
    console.log(data);

}

function cleanHTML() {
    while(weatherInfo.firstChild) {
        weatherInfo.removeChild(weatherInfo.firstChild);
    }
}

