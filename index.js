// eventListener on setting icon, question mark to give up and enter image
const form = $("#my-form");
const addDiv = $(".guess-location-div");
let answer = {};
let colors = [];
let guesses = 0;
let guess;
let userGuess;
let countries;
let haversineDistance;

(async function getCountries() {
  //const res = await fetch(
  "https://restcountries.com/v3.1/all?fields=name,latlng,population,independent,region"
  );
  const countryData = await res.json();
  let randoNum = Math.floor(Math.random() * 251);
  while (countryData[randoNum].independent !== true) {
    randoNum = Math.floor(Math.random() * 251);
    console.log("ran");
  }
  const hemi = countryData[randoNum].latlng[0] > 0 ? "Northern" : "Southern";
  answer = {
    name: countryData[randoNum].name.common,
    region: countryData[randoNum].region,
    lat: countryData[randoNum].latlng[0],
    lon: countryData[randoNum].latlng[1],
    population: countryData[randoNum].population,
    hemisphere: hemi,
  };
  console.log(countryData);
  countries = [...countryData];
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
        hemisphere: countries[i].latlng[0] > 0 ? "Northern" : "Southern",
      };
    }
  }
  console.log(answer);
  createGuess();
}

function createGuess() {
  const r = 3959; // radius of the Earth in miles
  const dLat = ((userGuess.lat - answer.lat) * Math.PI) / 180; // haversine formula to calculate distance based on latitude and longitude
  const dLon = ((userGuess.lon - answer.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((answer.lat * Math.PI) / 180) *
      Math.cos((userGuess.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let distance = Math.round(r * c);
  haversineDistance = distance; //this is how many miles the user guess is in relation to the answer
  console.log(haversineDistance);
  for(let key in answer){
    if(answer[key] === userGuess[key]){
      colors.push("green")
    }else {
      colors.push("red")
    }
  }
  guesses++; // incrementing guesses so we can add it to the h5 dynamically
  console.log(colors);
  addDiv.append(
    $(`<h5>${guesses}.${userGuess.name}</h5>`).addClass(
      `row justify-content-start`
    )
  );
  const hemisphere = colors[5];
  addDiv.append(
    $(`<div>${userGuess.hemisphere}</div>`).addClass(`guess-hint-div ${hemisphere}`)
  );
  const region = colors[1]
  addDiv.append($(`<div>${userGuess.region}</div>`).addClass(`guess-hint-div ${region}`));
  const popColor = colors[4];
  addDiv.append(
    $(`<div>${userGuess.population}</div>`).addClass(`guess-hint-div ${popColor}`)
  );
  addDiv.append(
    $(`<div>${haversineDistance} miles</div>`).addClass("guess-hint-div blue")
  );
}

form.on("submit", getGuess);
