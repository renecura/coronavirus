const max_persons = 500;
const initial_infected = 0.01;

const normal_situation = {
  infected_prob: 0.99,
  threshold: 15, // Number of days when the virus show symptoms
  recover: 30, // Number of days the person recovers (or die :( )
  spread_range: 25, // Distance of infection
  mortality: 0.13, // Mortality percentage
  travel_limit: 0 // Distance of travel (0 means no limit)
}


let situation = normal_situation;

let chart;

let day = 0;
let data = {}

let persons = []


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
    p.next_day();

    // If p gets sick then it goes to the tree
    if (p.is_infected()) {
      let pt = new Point(p.position.x,p.position.y);     
      qtree.insert(pt);     
    }


    // verify if p gets sick
    if (!p.is_infected()) {
      const range = new Circle(p.position.x, p.position.y, situation.spread_range);
      let fs = qtree.query(range); 

      if(fs.length > 0){
        if (random(1) < situation.infected_prob ) {
          p.infect();
        }
      }      
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
  select('#start').hide();
}

function action() {
  noLoop();
}

function setup() {
  noLoop();
  frameRate(60);

  const canvas = createCanvas(800, 600);
  canvas.parent("canvas");

  let button = select('#start');
  button.mousePressed(start);

  button = select('#action');
  button.mousePressed(action);

  for (let i = 0; i < max_persons; i++)
    persons.push(
      new Person(width, height, situation)
      );

  for (let i = 0; i < max_persons * initial_infected; i++) {
    persons[i].infected = 1;
  }

  chart = new Chart();

}

let spreadtime = 60;

function draw() {
  background(220);

  let icount = 0;
  
  
  for(let i = 0; i < persons.length; i++){
    persons[i].update();
    persons[i].show();

    if (persons[i].is_infected()) icount++;
  }
      
  if (spreadtime > 0) {
    spreadtime--;
  } else {
    data = spread();
    spreadtime = 60;    
    day++;
    console.log("Day:", day, "iCount", data);

    chart.addData(day, data);

    if (data.infected <= 0) noLoop();
  }
}