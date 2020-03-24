const max_persons = 500;
const initial_infected = 0.005;
const framesInDay = 120;

const virus = {
  infected_prob: 0.99,
  threshold: 15, // Number of days when the virus show symptoms
  recover: 30, // Number of days the person recovers (or die :( )
  spread_range: 25, // Distance of infection
  mortality: 0.13, // Mortality percentage  
}

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

function spread() {

  let data = {};
  data.infected = 0;
  data.has_symptoms = 0;
  data.recovered = 0;
  data.dead = 0;
  data.healthy = 0;

  // Creates the Quadtree
  let qtree = QuadTree.create();
  
  for(let i = 0; i < persons.length; i++){

    const p = persons[i];
    p.next_day(data.has_symptoms > 100, virus);

    // If p gets sick then it goes to the tree
    if (p.is_infected()) {
      let pt = new Point(p.position.x,p.position.y);     
      qtree.insert(pt);     
    }


    // verify if p gets sick
    if (!p.is_infected()) {
      const range = new Circle(p.position.x, p.position.y, 
        virus.spread_range);
      let fs = qtree.query(range); 

      if(fs.length > 0) p.infect(virus);     
    }
    
    // Gather data
    if (p.is_infected()) data.infected++;
    if (p.has_symptoms()) data.has_symptoms++;
    if (p.is_cured()) data.recovered++;
    if (p.is_dead()) data.dead++;
    if (p.is_healthy()) data.healthy++;

  }

  return data;
}

function start() {
  loop();
  startButton.hide();
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

function setup() {
  noLoop();
  frameRate(60);

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



  for (let i = 0; i < max_persons; i++)
    persons.push(
      new Person(width, height)
      );

  for (let i = 0; i < max_persons * initial_infected; i++) {
    persons[i].infected = 1;
  }

  chart = new Chart();

}

let spreadtime = framesInDay;

function draw() {
  background(220);

  let p = 0;
  for(let i = 0; i < persons.length; i++){
    p += persons[i].update(states[current_state]);
    persons[i].show();
  }
  points += p / (persons.length * framesInDay);

  if (spreadtime > 0) {
    spreadtime--;
  } else {
    data = spread();
    spreadtime = framesInDay;    
    day++;
    console.log("Day:", day, "iCount", data, "points", points);

    chart.addData(day, data);

    if (data.infected <= 0) noLoop();
  }
}