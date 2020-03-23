
const default_config = {
  max_wait: 60,
  person_size: 5
}


class Person {

  constructor(width, height, situation, config) {
    
    this.config = (!config)? default_config: config;
    this.situation = situation; 
    
    this.world = {}
    this.world.w = width;
    this.world.h = height;
    
    // Set the position of the home
    this.home = createVector(
      random(width),
      random(height)
    );
    this.inhome = true;

    // The initial position is the home
    this.position = this.home.copy();

    // Set initial wait
    this.wait = this.config.max_wait - random(this.config.max_wait / 2);

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
    if (random(1) < this.situation.infected_prob) {
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
    return (this.infected > this.situation.threshold);
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

  set_target() {
    this.inhome = !this.inhome; // Pendular trip
      
    // New target
    if (this.inhome) {
      this.target = createVector(
        random(this.world.w),
        random(this.world.h)
      );

      if (this.situation.travel_limit > 0){
        let distance = p5.Vector.sub(this.target, this.position);
        distance.limit(this.situation.travel_limit);
        this.target = p5.Vector.add(this.position, distance);
      }
    } else {
      this.target = this.home.copy();
    }
  }

  next_day(saturated) {

    if (this.is_dead()) return;

    if (this.is_infected()) {
      this.infected++;
    }

    if (this.infected > this.situation.recover) {

      const r = (saturated)? 0.25: 1;

      if (random(r) > this.situation.mortality) {
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
      this.wait = random(this.config.max_wait);
      this.set_target();
    }
    
  }
}

if (typeof module !== "undefined") {
  module.exports = { Person };
}