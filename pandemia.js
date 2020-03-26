const virus = {
  infected_prob: 0.70,
  threshold: 15, // Number of days when the virus show symptoms
  recover: 30, // Number of days the person recovers (or die :( )
  spread_range: 25, // Distance of infection
  mortality: 0.13, // Mortality percentage  
}

class Pandemia {

  static spread(people) {

    let data = {};
    data.infected = 0;
    data.has_symptoms = 0;
    data.recovered = 0;
    data.dead = 0;
    data.healthy = 0;
  
    // Creates the Quadtree
    let qtree = QuadTree.create();
    
    for(let i = 0; i < people.length; i++){
  
      const p = people[i];
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

}


if (typeof module !== "undefined") {
  module.exports = { Pandemia };
}