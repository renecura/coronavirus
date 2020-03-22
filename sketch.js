const max_persons = 400;
const max_wait = 60;

const person_size = 5;
const infected_prob = 0.99;
const threshold = 15;
const recover = 30;

const spread_range = 25;

const initial_infected = 0.01;
const mortality = 0.13;


let chart;


let travel_limit = 0;





let day = 0;
let data = {}

class Person {
  constructor() {
    // Set the position of the home
    this.home = createVector(
      random(width),
      random(height)
    );
    this.inhome = true;

    // The initial position is the home
    this.position = this.home.copy();

    // Set initial wait
    this.wait = max_wait - random(max_wait / 2);

    // Set the initial target
    this.set_target();


    // Determine if the person is infected
    this.infected = 0;    
    //this.infect();
  }

  infect() {
    if (this.infected > 0) return;
    if (this.infected < 0) return;

    // Determine if the person is infected
    if (random(1) < infected_prob) {
      this.infected = 1;
      //console.log("New infected!");
      return;
    }

    this.infected = 0;    
  }

  is_infected() {
    return (this.infected > 0);
  }

  is_cured() {
    return (this.infected == -1);
  }

  is_dead() {
    return (this.infected == -2);
  }

  has_symptoms() {
    return (this.infected > threshold);
  }

  is_healthy() {
    return !this.is_dead() && !this.is_infected();
  }


  show() {
    
    if (this.is_dead()) {
      fill(0);
    } else if (this.has_symptoms()) {
      fill(200,0,0);
    } else if (this.is_infected()) {
      fill(128,69,0);
    } else if (this.is_cured()) {
      fill(196,0,196);
    } else {
      fill(0,128,128);
    }
    
    
    noStroke();
    circle(this.position.x, this.position.y, person_size);
    
    // if (this.infected > threshold){
    //   fill('rgba(255,0,0, 0.10)');
    //   circle(this.position.x, this.position.y, spread_range);
    // }
    // Draw the target
    // fill(255,0,0);
    // circle(this.target.x, this.target.y, 10);
  }

  set_target() {
    this.inhome = !this.inhome; // Pendular trip
      
    // New target
    if (this.inhome) {
      this.target = createVector(
        random(width),
        random(height)
      );

      if (travel_limit > 0){
        let distance = p5.Vector.sub(this.target, this.position);
        distance.limit(travel_limit);
        this.target = p5.Vector.add(this.position, distance);
      }
    } else {
      this.target = this.home.copy();
    }
  }

  next_day() {
    if (this.is_dead()) return;

    if (this.is_infected()) {
      this.infected++;
    }

    if (this.infected > recover) {

      const r = (data.infected > 0.25 * max_persons)? 0.25: 1;

      if (random(r) > mortality) {
        this.infected = -1; // It's cured!
      } else {
        this.infected = -2; // It's dead!
      }      
    }
  }

  update() {

    if (this.is_dead()) return;

    if (this.wait > 0) {
      this.wait--;
      return;
    }

    if (this.has_symptoms()) return;

    let move = p5.Vector.sub(this.target, this.position);
    move.limit(2);
    this.position.add(move);

    if (p5.Vector.sub(this.position,this.target).magSq() < 10) {
      // Wait in the zone
      this.wait = random(max_wait);
      this.set_target();
    }
    
  }
}

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
      const range = new Circle(p.position.x, p.position.y, spread_range);
      let fs = qtree.query(range); 

      if(fs.length > 0){
        if (random(1) < infected_prob ) {
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
}


function setup() {
  noLoop();
  frameRate(60);
  createCanvas(800, 600);

  let button = createButton('Start');
  button.position(19, 19);
  button.mousePressed(start);

  for (let i = 0; i < max_persons; i++)
    persons.push(new Person())

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