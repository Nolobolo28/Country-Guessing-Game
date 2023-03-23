const form = $("#my-form");
const addDiv = $(".guess-location-div");
const settings = $(".settings");
let answer = {};
let colors = [];
let countryNames = [];
let guesses = 0;
let guess;
let userGuess = "N/A";
let showGiveAnswer = false;
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
  countries = [...countryData];
})();

let alreadyGuessed = [];

function getGuess(ev) {
  if (showGiveAnswer) {
    $(
      ".correct-answer, .give-answer-btn, .confirm-give-answer, .give-answer-exit"
    ).removeClass("show");
    $(
      ".correct-answer, .give-answer-btn, .confirm-give-answer, .give-answer-exit"
    ).addClass("collapse");
    $("#go-again, .congrats-h2, .first-bottom-hr").removeClass("collapse");
  } // this is hiding the give up div if it is shown we don't need it displaying after a user has guessed

  ev.preventDefault();
  let myForm = ev.target;
  let fd = new FormData(myForm);
  for (const [key, value] of fd) {
    guess = value;
  }
  guess = guess.toLowerCase(); // Formatting the guess to find the country's data associated with guess
  guess = guess.replace(/\b\w/g, (l) => l.toUpperCase());
  guess = guess.replace(/(And)\s|(The)\s|(Of)\s/g, (l) => l.toLowerCase()); // if the word And is in the country it is replaced to all lower case
  guess = guess.replace(/(Dr)/g, (l) => l.toUpperCase()); //special case where Dr Congo needs to be DR Congo for Democratic Republic of the Congo
  guess = guess.replace(/(O)\s|(N)cipe/g, (l) => l.toLowerCase()); //also special case with accented letters

  if (guess === "") {
    $(".invalid-h3").text("Your guess is invalid!"); //displaying invalid guess if the user guesses nothing
    $(".invalid-guess").css("display", "block");
    $(".suggestion-div").css("display", "none");
    setTimeout(clear, 2500);
  } else if (alreadyGuessed.indexOf(guess) !== -1) {
    $(".invalid-h3").text("You can't guess this twice!"); //checking the alreadyGuessed array if the user guessed anything twice
    $(".invalid-guess").css("display", "block");
    $(".suggestion-div").css("display", "none");
    return setTimeout(clear, 2500);
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

      $(".suggestion-div").css("display", "none");
      alreadyGuessed.push(guess);
      return checkGuess();
    }
  }

  if (userGuess === "N/A") {
    $(".invalid-guess").css("display", "block");
    $(".suggestion-div").css("display", "none");
    setTimeout(clear, 2500); // guess is invalid since we didn't find a country
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
  for (let key in answer) {
    if (answer[key] === userGuess[key]) {
      colors.push("green"); //if the answer's key = to userGuess's key then we want to display the color green otherwise display red for incorrect
    } else {
      colors.push("red");
    }
  }
  guesses++; // incrementing guesses so we can add it to the h5 dynamically

  addDiv.append(
    $(`<h5>${guesses}. ${userGuess.name}</h5>`).addClass(
      `row text-left align-items-start guess-h5`
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
  let stringUserPopulation = userGuess.population.toString().split("");
  let pop = stringUserPopulation.length;
  if (pop < 7) {
    pop = userGuess.population.toLocaleString();
  } else if (pop === 7) {
    pop = `${stringUserPopulation[0]}.${stringUserPopulation[1]}M`;
  } else if (pop === 8) {
    pop = `${stringUserPopulation[0]}${stringUserPopulation[1]}.${stringUserPopulation[2]}M`;
  } else if (pop === 9) {
    pop = `${stringUserPopulation[0]}${stringUserPopulation[1]}${stringUserPopulation[2]}.${stringUserPopulation[3]}M`;
  } else {
    pop = `${stringUserPopulation[0]}.${stringUserPopulation[1]}B`;
  }
  const popColor = colors[4];
  const arrowImg = $(`<div>${pop}</div>`).addClass(
    `guess-hint-div arrow-img-div ${popColor}`
  );
  addDiv.append(arrowImg);

  let higherLower;
  if (answer.population > userGuess.population) {
    higherLower = "top";
  } else if (answer.population < userGuess.population) {
    higherLower = "bottom"; //displaying arrow image on bottom if userGuess population is too high
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
    let pinDiv = $(`<div></div>`).addClass(
      `guess-hint-div mx-auto ${distanceColor}`
    );
    addDiv.append(pinDiv);
    pinDiv.append(
      $("<img></img>")
        .addClass("pin-img p-auto")
        .attr("src", "./images/pin.png")
        .attr("alt", "location pin image")
    ); //adding the pin image if the user guessed correctly
  } else {
    distanceColor = "blue";
    addDiv.append(
      $(`<div>${haversineDistance.toLocaleString()}mi</div>`).addClass(
        `guess-hint-div miles-div ${distanceColor}`
      )
    );
  }
  if (guesses > 3) {
    addDiv.scrollTop($(".guess-location-div")[0].scrollHeight); //sets the scrollTop of the element to the scrollHeight of the element moving the scrollbar to the bottom
    $(".guess-location-div").css("padding-bottom", "2rem"); //adjusts the padding-bottom after the third guess
  }
  if (correctGuess === false) {
    clear();
  }
}

let correctGuess = false;

function checkGuess() {
  if (userGuess.name === answer.name) {
    $(".input-div").css("display", "none");
    correctGuess = true;
    $(".correct-answer").removeClass("collapse");
    $(".correct-answer").addClass("show");
    setTimeout(() => location.reload(), 7000);
  }
  createGuess();
}

function clear() {
  $(".invalid-guess").css("display", "none");
  colors = [];
  haversineDistance;
  guess = "";
  userGuess = "N/A";
  form.trigger("reset");
}

function autoSuggestion(e) {
  $(".suggestion-div").css("display", "block");
  let names = [...countryNames];
  let val = e.target.value.toLowerCase().split("");
  names = names.filter((country) => {
    return val.every((letter) => {
      return country.includes(letter); //returning every country name that includes the letters the user types
    });
  });
  names = names.sort();

  $(".suggestion-ul").empty(); //emptying the previous suggestions
  names.forEach((name) => {
    return $(".suggestion-ul").append(`<li class='suggestion-li'>${name}</li>`);
  });
}

function fillInput(e) {
  let countryText = $(e.target).text();
  countryText = countryText.replace(/\b\w/g, (l) => l.toUpperCase());
  countryText = countryText.replace(/(And)\s|(The)\s|(Of)\s/g, (l) =>
    l.toLowerCase()
  );
  countryText = countryText.replace(/(Dr)/g, (l) => l.toUpperCase()); //special case where Dr Congo needs to be DR Congo for Democratic Republic of the Congo
  countryText = countryText.replace(/(O)\s|(N)cipe/g, (l) => l.toLowerCase());
  $(".country-guess").val(countryText);
  $(".suggestion-div").css("display", "none"); //hiding the suggestion countries since we filled the input box
  $(".country-guess").focus();
}

function giveAnswer() {
  showGiveAnswer = true;
  $(
    ".correct-answer, .give-answer-btn, .confirm-give-answer, .give-answer-exit"
  ).removeClass("collapse"); //removing the collapse class from bootstrap that is hiding the necessary elements
  $(
    ".correct-answer, .give-answer-btn, .confirm-give-answer .give-answer-exit"
  ).addClass("show");
  $("#go-again, .congrats-h2, .first-bottom-hr").addClass("collapse"); //hiding elements that are not needed
}

let gaveAnswer = false;

function hideGiveAnswer() {
  showGiveAnswer = false; //changing showGiveAnswer to false to let us know that the give up div is currently not displaying
  $(
    ".correct-answer, .give-answer-btn, .confirm-give-answer, .give-answer-exit"
  ).removeClass("show");
  $(
    ".correct-answer, .give-answer-btn, .confirm-give-answer, .give-answer-exit"
  ).addClass("collapse");
  $("#go-again, .congrats-h2, .first-bottom-hr").removeClass("collapse");

  if (gaveAnswer) {
    userGuess = { ...answer };
    $(".congrats-h2").text(`The correct country is ${answer.name}.`);
    checkGuess();
  } // if user has elected to give up it is copying everything from the answer object and displaying the correct answer
}

form.on("submit", getGuess);

settings.click(() => {
  if (showGiveAnswer) {
    $(
      ".correct-answer, .give-answer-btn, .confirm-give-answer, .give-answer-exit"
    ).removeClass("show");
    $(
      ".correct-answer, .give-answer-btn, .confirm-give-answer, .give-answer-exit"
    ).addClass("collapse");
    $("#go-again, .congrats-h2, .first-bottom-hr").removeClass("collapse");
    showGiveAnswer = false;
  }
  $(".hint-div, .input-div, .guess-location-div, .main-settings").toggle();
});

$(".exit-img").click(() =>
  $(".hint-div, .input-div, .guess-location-div, .main-settings").toggle()
);

$(".country-guess").on("input", autoSuggestion);

$(".suggestion-div").click(fillInput);

$("body").click(() => {
  return $(".suggestion-div").css("display", "none");
});

$(".question-mark-img").click(() => giveAnswer());

$(".give-answer-exit").click(hideGiveAnswer);

$(".give-answer-btn").click(() => {
  gaveAnswer = true;
  hideGiveAnswer();
});

$("#go-again").click(() => setTimeout(location.reload(), 1000));
