const max_persons = 500;
const initial_infected = 0.005;
const framesInDay = 60;
const lastDay = 7;
const infectionDay = 5;

// level: indicates if the person still can move.
// travel_limit: Distance of travel (0 means no limit)
const states = [];

states.push({
  level: 0,
  travel_limit: 0, // No limit
  points: 12
});
states.push({
  level: 1,
  travel_limit: 150,
  points: 6
});
states.push({
  level: 2,
  travel_limit: 30,
  points: 3
});
states.push({
  level: 3,
  travel_limit: 10,
  points: 1
});

let current_state = 0; // Normal state 
let points = 0;

let chart;

let day = 0;
let data = {}

let persons = []


let startButton
let actionButton
let takeButton


function start() {
  loop();
  //startButton.hide();
  
  $('#startScreen').modal('show');

  actionButton.show();
}

function action() {
  noLoop();
}

function set_action(value) {
  current_state = value;
}

function take() {
  loop();
}

function showResult() {

  // Some crazy calculation
  noLoop();

  let p = new Intl.NumberFormat().format(points);
  console.log(p);
  
  select('#finalPoints').innerHTML = p;
  
  $('#pointsScreen').modal('show');
}

function setup() {
  noLoop();
  frameRate(30);

  const canvas = createCanvas(800, 600);
  canvas.parent("canvas");

  // Connect buttons
  startButton = select('#start');
  actionButton = select('#action');
  takeButton = select('#take');

  startButton.mousePressed(start);

  actionButton.mousePressed(action);
  actionButton.hide();

  takeButton.mousePressed(take);


  // Create people
  for (let i = 0; i < max_persons; i++)
    persons.push(
      new Person(width, height)
      );
  


  chart = new Chart();

  startButton.show();
}


let frameCounter = 0;

function draw() {
  background(220);

  // Move each person and gathered point.
  let p = persons.reduce( (acc, person) => 
    acc + person.move(states[current_state])
  , 0);
  points += p / (persons.length * framesInDay);

  // Draw each person
  persons.forEach(p => p.show());
  
  // Advance the frame counter.
  frameCounter++;

  // Process the pandemia when the day pass
  if (frameCounter > framesInDay) {

    frameCounter = 0;
    day++;

    // Spread the virus every frame
    data = Pandemia.spread(persons);
    
    if (day > infectionDay) {
      persons[0].infected = 1; // Patient 0
      data.infected++;
      data.healthy--;
    }

    // Plot the data
    chart.addData(day, data);

    console.log("Day:", day, "Data", data, "Points", points);

    // In the last day, stops the simulation and show the final result
    if (day > lastDay) {
      showResult();
    } 
    
  }
}