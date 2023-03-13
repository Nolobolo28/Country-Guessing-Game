// eventListener on setting icon, question mark to give up and enter image
const form = $("#my-form");
const addDiv = $(".guess-location-div")
let answer = {};
let guess;
let userGuess;
let countries;

(async function getCountries() {
  //const res = await fetch("https://restcountries.com/v3.1/all?fields=name,latlng,population,independent,region");
  const countryData = await res.json();
  let randoNum = Math.floor(Math.random() * 251);
  while (countryData[randoNum].independent !== true) {
    randoNum = Math.floor(Math.random() * 251);
    console.log("ran");
  }
  console.log(countryData);
  const hemi = countryData[randoNum].latlng[0] > 0 ? "Northern" : "Southern";
  answer = {
    name: countryData[randoNum].name.common,
    region: countryData[randoNum].region,
    lat: countryData[randoNum].latlng[0],
    lon: countryData[randoNum].latlng[1],
    population: countryData[randoNum].population,
    hemisphere: hemi,
  };
  countries = [...countryData];
  //console.log(answer);
})();

function getGuess(ev) {
  ev.preventDefault();
  let myForm = ev.target;
  let fd = new FormData(myForm);
  for (const [key, value] of fd) {
    guess = value;
  }
  for (let i = 0; i < countries.length; i++) {
    if (countries[i].name.common === guess) {
      userGuess = {
        name: countries[i].name.common,
        region: countries[i].region,
        lat: countries[i].latlng[0],
        lon: countries[i].latlng[1],
        population: countries[i].population,
        hemisphere: countries[i].latlng[0] > 0 ? "Northern" : "Southern"
      };
    }
  }
}

function createGuess() {
    
}

form.on("submit", getGuess);
