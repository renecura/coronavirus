
google.charts.load('current', {'packages':['corechart']});

class Chart {

  constructor() {
    this.options = {
      title: 'Evolución del virus',
      hAxis: {title: 'Día',  titleTextStyle: {color: '#333'}},
      vAxis: {minValue: 0},
      colors: ['#FF0000','#008080','#C400C4','#000000'],
      isStacked: 'absolute'
    };
  
    this.chart = new google.visualization.AreaChart(
      document.getElementById('chart_div')
    );

    this.data = [["Día", "Infectada", "Saludable", "Recuperada", "Muertes"]];
   
  }

  addData(day, data) {
    this.data.push([
      day,
      data.has_symptoms,
      data.healthy + data.infected - data.has_symptoms - data.recovered,
      data.recovered,
      data.dead
    ]);
    this.drawChart();
  }

  drawChart() {
    const data = google.visualization.arrayToDataTable(this.data);
    this.chart.draw(data, this.options);
  }

}



if (typeof module !== "undefined") {
  module.exports = { Chart };
}