// eventListener on setting icon, question mark to give up and enter image
const form = $("#my-form");
const addDiv = $(".guess-location-div");
const settings = $(".settings");
let answer = {};
let colors = [];
let countryNames = [];
let guesses = 0;
let guess;
let userGuess = "N/A";
let countries;
let haversineDistance;

(async function getCountries() {
  const res = await fetch(
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
  for (let i = 0; i < countryData.length; i++) {
    if (countryData[i].independent === true) {
      countryNames.push(countryData[i].name.common.toLowerCase()); //adding all the country names to an array we can filter when the user types characters
    }
  }
  console.log(answer.name);
  console.log(countryData);
  console.log(countryNames);
  countries = [...countryData];
})();

function getGuess(ev) {
  ev.preventDefault();
  let myForm = ev.target;
  let fd = new FormData(myForm);
  for (const [key, value] of fd) {
    guess = value;
  }
  guess = guess.toLowerCase(); // Formatting the guess to find the country's data associated with guess
  guess = guess.replace(/\b\w/g, (l) => l.toUpperCase());
  guess = guess.replace(/(And)/g, (l) => l.toLowerCase()); // if the word And is in the country it is replaced to all lower case
  console.log("ran get guess");
  console.log(guess);
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
      console.log(answer);
      $(".suggestion-div").css("display", "none");
      checkGuess();
    }
  }
  if (userGuess === "N/A") {
    $(".invalid-guess").css("display", "block");
    $(".suggestion-div").css("display", "none");
    setTimeout(clear, 5000);
  }
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
  for (let key in answer) {
    if (answer[key] === userGuess[key]) {
      colors.push("green"); //if the answer's key = to userGuess's key then we want to display the color green otherwise display red for incorrect
    } else {
      colors.push("red");
    }
  }
  guesses++; // incrementing guesses so we can add it to the h5 dynamically
  console.log(colors);
  addDiv.append(
    $(`<h5>${guesses}.${userGuess.name}</h5>`).addClass(
      `row justify-content-start`
    )
  );
  const hemisphere = colors[5]; //adding the corresponding color
  addDiv.append(
    $(`<div>${userGuess.hemisphere}</div>`).addClass(
      `guess-hint-div ${hemisphere}`
    )
  );
  const region = colors[1];
  addDiv.append(
    $(`<div>${userGuess.region}</div>`).addClass(`guess-hint-div ${region}`)
  );
  const popColor = colors[4];
  const arrowImg = $(`<div>${userGuess.population}</div>`).addClass(
    `guess-hint-div arrow-img-div ${popColor}`
  );
  addDiv.append(arrowImg);

  let higherLower;
  if (answer.population > userGuess.population) {
    higherLower = "top";
  } else if (answer.population < userGuess.population) {
    higherLower = "bottom";
  }
  let src = "./images/arrow.png";
  let alt = "arrow image";
  if (correctGuess === false) {
    $(arrowImg).append(
      $(`<img></img>`)
        .addClass(`arrow-img ${higherLower} ${popColor}`)
        .attr("src", src)
        .attr("alt", alt)
    ); //checked to see if the user guessed correctly if so there is no need to display this image
  }
  let distanceColor;
  if (correctGuess) {
    distanceColor = "green"; //if the user guesses correctly the distance div color will be displayed green
  } else {
    distanceColor = "blue";
  }
  addDiv.append(
    $(`<div>${haversineDistance} miles</div>`).addClass(
      `guess-hint-div ${distanceColor}`
    )
  );
  if (correctGuess === false) {
    clear();
  }
}

function showSettings() {
  let backgroundImg;
  if ($("body").css("background-image") === "url(../images/worldmap.png)") {
    backgroundImg = "none";
  } else {
    backgroundImg = "url(../images/worldmap.png)";
  }
  $(".hint-div, .input-div, .guess-location-div, .main-settings").toggle();
  $("body").css("background-image", backgroundImg);
}

let correctGuess = false;

function checkGuess() {
  if (userGuess.name === answer.name) {
    $(".input-div").css("display", "none");
    correctGuess = true;
    $(".correct-answer").css("display", "block");
    setTimeout(() => location.reload(), 10000);
  }
  createGuess();
}

function clear() {
  $(".invalid-guess").css("display", "none");
  userGuess = {};
  colors = [];
  haversineDistance;
  guess = "";
  form.trigger("reset");
}

let checked = false;
function lightMode() {
  checked = !checked;
  console.log(checked);
  if (checked) {
    $("body").css("background-color", "rgb(211, 208, 208)");
    $("body").css("color", "#333");
  } else {
    $("body").css("background-color", "#333");
    $("body").css("color", "white");
  }
}

function autoSuggestion(e) {
  $(".suggestion-div").css("display", "block");
  console.log(e.target.value);
  let names = [...countryNames];
  let val = e.target.value.toLowerCase().split("");
  names = names.filter((country) => {
    return val.every((letter) => {
      return country.includes(letter); //returning every country name that includes the letters the user types
    });
  });
  names = names.sort();
  console.log(names);
  $(".suggestion-ul").empty();
  names.forEach((name) => {
    return $(".suggestion-ul").append(`<li class='suggestion-li'>${name}</li>`);
  });
}

function fillInput(e) {
  let countryText = $(e.target).text();
  countryText = countryText.replace(/\b\w/g, (l) => l.toUpperCase());
  countryText = countryText.replace(/(And)/g, (l) => l.toLowerCase());
  $(".country-guess").val(countryText);
  $(".suggestion-div").css("display", "none"); //hiding the suggestion countries since we filled the input box
}

form.on("submit", getGuess);

settings.click(showSettings);

$(".exit-img").click(showSettings);

$("#dark-mode").click(lightMode);

$(".country-guess").on("input", autoSuggestion);

$(".suggestion-div").click(fillInput);

$("document").click(function hideAutoSuggestion() {
  $(".suggestion-div").css("display", "none");
});

$("#go-again").click(() => setTimeout(() => location.reload(), 5000));
