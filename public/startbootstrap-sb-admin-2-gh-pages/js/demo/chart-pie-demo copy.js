(function () {// Set new default font family and font color to mimic Bootstrap's default styling
  Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = '#858796';

  // Pie Chart Example

  var ctx = document.getElementById("myPieChart");
  function categorySales() {
    fetch('/admin/categorySales', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.categoryNames);
        var myPieChart = new Chart(ctx, {

          type: 'doughnut',
          data: {
            labels: data.categoryNames,
            datasets: [{
              data: data.values,
              backgroundColor: ['#b91d47', '#00aba9', '#2b5797',"#e8c3b9","#1e7145"],
              hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
              hoverBorderColor: "rgba(234, 236, 244, 1)",
            }],
          },
          options: {
            maintainAspectRatio: false,
            tooltips: {
              backgroundColor: "rgb(255,255,255)",
              bodyFontColor: "#858796",
              borderColor: '#dddfeb',
              borderWidth: 1,
              xPadding: 15,
              yPadding: 15,
              displayColors: false,
              caretPadding: 10,
            },
            legend: {
              display: false
            },
            cutoutPercentage: 80,
          },
        })

      });
  }

  categorySales();
})();