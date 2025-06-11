// Import token data management functionality
import {
  coinList,
  myTokens,
  getHourlyOHLCV,
  getDailyOHLCV,
  getMonthlyOHLCV,
  get3MonthOHLCV
} from './tokenData.js';

// Current timeframe
let currentTimeframe = '24h';

// Configure chart defaults
Chart.defaults.scale.gridLines.display = false;

// Creates and attaches a chart to a token item
const createChart = (token, chartLabels, chartData) => {
  // Find the token that will get chart attached
  var targetToken = document.querySelector(`[data-token='${token}']`)
  // Create chart element
  const targetTokenChart = document.createElement('canvas')
  targetTokenChart.id = `chart-${token}`
  targetTokenChart.className = 'tokenChart'
  targetTokenChart.innerHTML = ''
  // Attach chart element to target token
  targetToken.appendChild(targetTokenChart)

  // Find the lowest value in the data set for the chart
  var lowestDataValue = Math.min(...chartData)
  // Create a smaller value for use as as floor in chart
  var aestheticMin = lowestDataValue*0.98

  var ctx = targetTokenChart.getContext('2d');
  var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
          labels: chartLabels,
          datasets: [{
              label: 'My First dataset',
              backgroundColor: '#0047ff',
              borderColor: '#0047ff',
              pointRadius: 0,
              data: chartData
          }]
      },

      // Configuration options go here
      options: {
        layout: {
          padding: {
            top: 40,
          },
        },
        legend: {
          display: false,
        },
        gridLines: {
          display: false,
        },
        scales: {
          xAxes: [{
            display: false
          }],
          yAxes: [{
            display: false,
            ticks: {
              suggestedMin: aestheticMin,
            },
          }],
        },
        plugins: {
          // Change options for ALL labels of THIS CHART
          datalabels: {
            display: false,
            color: 'rgba(0,0,0,0.5)',
            align: 'end',
            textAlign: 'end',
            offset: 20,
            font: {
              weight: 'bold',
            },
            formatter: function(value, context) {
              return chartData[context.dataIndex] + '\n' + chartLabels[context.dataIndex];
            },
          },
        },
      }
  });
}

const createMinChart = (token, chartData) => {
  // Find the token chart container that will get chart attached
  var targetToken = document.querySelector(`[data-token='${token}']`).querySelector('.tokenChartContainer')
  // Clear out the containers "loading"
  targetToken.innerHTML = ''
  // Create chart element
  const targetTokenChart = document.createElement('canvas')
  targetTokenChart.id = `chart-${token}`
  targetTokenChart.className = 'tokenChart'
  targetTokenChart.innerHTML = ''
  // Attach chart element to target token
  targetToken.appendChild(targetTokenChart)

  // Find the lowest value in the data set for the chart
  var lowestDataValue = Math.min(...chartData)
  // Create a smaller value for use as as floor in chart
  var aestheticMin = lowestDataValue*0.98

  var ctx = targetTokenChart.getContext('2d');
  var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
          datasets: [{
              label: 'My First dataset',
              backgroundColor: 'rgba(0, 71, 255, 0.1)',
              borderColor: '#0047ff',
              pointRadius: 0,
              data: chartData
          }]
      },

      // Configuration options go here
      options: {
        layout: {
          padding: {
            top: 0,
          },
        },
        legend: {
          display: false,
        },
        gridLines: {
          display: false,
        },
        scales: {
          xAxes: [{
            display: false
          }],
          yAxes: [{
            display: false,
            ticks: {
              suggestedMin: aestheticMin,
            },
          }],
        },
        plugins: {
          // Change options for ALL labels of THIS CHART
          datalabels: {
            display: false,
          },
        },
      }
  });
}

const chartLabels = (token) => {
  Chart.helpers.each(Chart.instances, instance => {
    if (instance.chart.canvas.id === `chart-${token}`) {
      instance.options.plugins.datalabels = {
        color: 'rgba(0,0,0,0.5)',
            align: 'end',
            textAlign: 'end',
            offset: 20,
            font: {
              weight: 'bold',
            },
    };
      instance.update()
    }
  })
}

// Build a complete chart for a token
const buildChart = (token) => {
  // Get hourly prices depending on current timeframe only supports 24h for now will need changes once timeframes are togglable
  if (currentTimeframe === '24h') {
    getHourlyOHLCV(token).then(response => {
      // Array where our labels will go
      var chartLabels = []
      // Array where the data points will go
      var chartData = []
      // For each key in the object we got back from the fetch
      Object.keys(response.Data).forEach(k => {
        // Push a timestamp into chart labels
        chartLabels.push(response.Data[k].time)
        // Push a closing value into
        chartData.push(response.Data[k].close)
      })
      // Create the chart in a canvas document with the labels and data we requested
      //createChart(token, chartLabels, chartData) - chart with labels
      createMinChart(token, chartData) // Chart without labels
    })
  }
}

// Build charts for all of the users tokens
const buildChartAll = () => {
  myTokens.forEach((token) => {
    buildChart(token)
  })
}

// See if we load big screen things (only small charts for now)
const bigScreenCheck = (viewportWidth) => {
  if (viewportWidth > '599') {
    buildChartAll()
  }
}

// Set the current timeframe
const setTimeframe = (timeframe) => {
  currentTimeframe = timeframe;
}

// Get the current timeframe
const getTimeframe = () => {
  return currentTimeframe;
}

// Export chart functions
export {
  createChart,
  createMinChart,
  chartLabels,
  buildChart,
  buildChartAll,
  bigScreenCheck,
  setTimeframe,
  getTimeframe
};