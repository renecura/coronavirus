
const default_config = {
  max_wait: 60,
  person_size: 5
}


class Person {

  constructor(width, height, config) {
    
    this.config = (!config)? default_config: config;
    
    this.world = {}
    this.world.w = width;
    this.world.h = height;

    this.home = createVector(
      random(60, width-60),
      random(60, height-60)
    );
    
    // Set the initial position
    this.position = this.home.copy();
    
    // Set the initial target
    this.target = this.position;

    // Determine if the person is infected
    this.infected = 0;

    this.level = 1;
  }

  infect(virus) {
    if (this.infected > 0) return;
    if (this.infected < 0) return;

    // Determine if the person is infected
    if (random(1) < virus.infected_prob) {
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
    return (this.infected > 15);
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
    circle(this.position.x, this.position.y, this.config.person_size);
    
    // if (this.infected > threshold){
    //   fill('rgba(255,0,0, 0.10)');
    //   circle(this.position.x, this.position.y, spread_range);
    // }
    // Draw the target
    // fill(255,0,0);
    // circle(this.target.x, this.target.y, 10);
  }

  

  next_day(saturated, virus) {

    if (this.is_dead()) return;

    if (this.is_infected()) {
      this.infected++;
    }

    if (this.infected > virus.recover) {

      const r = (saturated)? 0.25: 1;

      if (random(r) > virus.mortality) {
        this.infected = -1; // It's cured!
      } else {
        this.infected = -2; // It's dead!
      }      
    }
  }

  // Return the points that this person generates.
  update(state) {

    // If dead or has symptoms not move
    if (this.is_dead() || this.has_symptoms()) 
      return 0; // No points

    // Animate the movement
    let move = p5.Vector.sub(this.target, this.position);
    move.limit(2);
    this.position.add(move);

    // If reach the target, set a new target.
    if (p5.Vector.sub(this.position,this.target).magSq() < 5) {
      this.set_target(state);
    }
    
    // Return points if succesefully move (Maybe others condition later).
    return state.points; 
  }
  
  set_target(state) {
    
    // Set a random destination from the home
    let v = p5.Vector.random2D();

    if (state.travel_limit == 0 || state.level < this.level) {
      v.setMag(random(300));
    } else {
      v.setMag(random(state.travel_limit));
    }
    

    this.target = p5.Vector.add(this.home, v);
    this.target.set(
      constrain(this.target.x, 0, this.world.w),
      constrain(this.target.y, 0, this.world.h)
    );

    // If there are some movement restriction, apply it.
    // if (state.travel_limit > 0){
    //   let distance = p5.Vector.sub(this.target, this.position);
    //   distance.limit(state.travel_limit);
    //   this.target = p5.Vector.add(this.position, distance);
    // }
  }

}

if (typeof module !== "undefined") {
  module.exports = { Person };
}