const max_persons = 500;
const framesInDay = 60;
const lastDay = 100;
const infectionDay = 4;

const formater = new Intl.NumberFormat().format

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

  $('#pointsScreen').modal('show');
  $("#ppoints").text(formater(points));
  
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

function showAlert(msg){

  $("#alert").html(msg);
  $("#alert").fadeIn();

  window.setTimeout(() => $('#alert').fadeOut(), 4000);
}



let frameCounter = 0;
let alerts = []
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

  // Spread the virus every X frames
  if(frameCounter % 10 == 0)
    Pandemia.spread(persons);

   

  // Process the pandemia when the day pass
  if (frameCounter > framesInDay) {

    frameCounter = 0;
    day++;

    $("#daycounter").text(''+day);
    $("#points").text(formater(points));

    data = Pandemia.next_day(persons);
    
    if (day == infectionDay) {
      persons[0].infected = 1; // Patient 0
      data.infected++;
      data.healthy--;
      showAlert("¡Personas de zonas en riesgo han ingresado a tu nación!");
    }

    if (data.infected > 50 && !alerts[1]) {
      showAlert("¡Muchas personas han tenido contacto con personas de riesgo!");
      alerts[1] = true;
    }

    if (data.has_symptoms > 0 && !alerts[2]) {
      showAlert("¡Se ha detectado la primer persona infectada!");
      alerts[2] = true;
    }

    if (data.has_symptoms > 250 && !alerts[3]) {
      showAlert("La mitad de la población presenta sintomas, quizás ya sea tarde para actuar...");
      alerts[3] = true;
    }

    if (data.deads > 100 && !alerts[4]) {
      showAlert("Hemos perdido un 20% de la pobalción. Es una catástrofe");
      alerts[4] = true;
    }

    if (data.recovered > 0 && !alerts[5]) {
      showAlert("¡Hemos registrado el primer paciente recuperado!");
      alerts[5] = true;
    }

    if (day > 89 && !alerts[6]) {
      showAlert("Resistí, solo faltan 10 días más");
      alerts[6] = true;
    }

    if (day > 15 && data.infected == 0 && data.has_symptoms == 0 && !alerts[7]) {
      showAlert("¡Lo lograste, erradicaste el virus!");
      alerts[7] = true;
    }

    // Plot the data
    chart.addData(day, data);

    console.log("Day:", day, "Data", data, "Points", formater(points));

    // In the last day, stops the simulation and show the final result
    if (day > lastDay) {
      showResult();
    } 
    
  }
}