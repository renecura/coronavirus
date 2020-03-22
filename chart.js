
google.charts.load('current', {'packages':['corechart']});

class Chart {

  constructor() {
    this.options = {
      title: 'Coronavirus evolution',
      hAxis: {title: 'Days',  titleTextStyle: {color: '#333'}},
      vAxis: {minValue: 0},
      isStacked: 'absolute'
    };
  
    this.chart = new google.visualization.AreaChart(
      document.getElementById('chart_div')
    );

    this.data = [["Day", "Infected", "Healthy", "Deaths"]];
   
  }

  addData(day, data) {
    this.data.push([
      day,
      data.infected,
      data.healthy,
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