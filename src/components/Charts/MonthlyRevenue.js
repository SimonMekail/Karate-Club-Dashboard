import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const MonthlyRevenueChart = ({ monthlyRevenue, predictedRevenue }) => {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!monthlyRevenue || monthlyRevenue.length === 0) return;

    const ctx = canvasRef.current;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const monthNames = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];

    
    const currentDate = new Date();
    let predictedMonth = currentDate.getMonth() + 1; 
    let predictedYear = currentDate.getFullYear();

    
    if (monthlyRevenue.length > 0) {
      const lastDataPoint = monthlyRevenue[monthlyRevenue.length - 1];
      predictedMonth = lastDataPoint.month === 12 ? 1 : lastDataPoint.month + 1;
      predictedYear =
        lastDataPoint.month === 12
          ? lastDataPoint.year + 1
          : lastDataPoint.year;
    }

    
    const labels = monthlyRevenue.map(
      (item) => `${monthNames[item.month - 1]} ${item.year}`
    );

    
    const allLabels = [
      ...labels,
      `${monthNames[predictedMonth - 1]} ${predictedYear} (متوقع)`,
    ];

    const dataValues = monthlyRevenue.map((item) => item.monthlyRevenue);

    
    let predictedValue;
    if (predictedRevenue) {
      predictedValue = predictedRevenue;
    } else {
      
      const lastThreeMonths = dataValues.slice(-3);
      predictedValue =
        lastThreeMonths.length > 0
          ? Math.round(
              lastThreeMonths.reduce((a, b) => a + b, 0) /
                lastThreeMonths.length
            )
          : dataValues[dataValues.length - 1];
    }

    const allDataValues = [...dataValues, predictedValue];

    
    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.8)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");

    
    const predictedGradient = ctx
      .getContext("2d")
      .createLinearGradient(0, 0, 0, 400);
    predictedGradient.addColorStop(0, "rgba(104, 180, 104, 0.6)");
    predictedGradient.addColorStop(1, "rgba(104, 180, 104, 0.1)");

    const data = {
      labels: allLabels,
      datasets: [
        {
          label: "الإيرادات الشهرية الفعلية",
          data: [...dataValues, null], 
          fill: true,
          backgroundColor: gradient,
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 3,
          pointBackgroundColor: "rgb(255, 255, 255)",
          pointBorderColor: "rgb(59, 130, 246)",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
          segment: {
            borderDash: (ctx) =>
              ctx.p1DataIndex === monthlyRevenue.length - 1
                ? [0, 0]
                : undefined,
          },
        },
        {
          label: "الإيرادات المتوقعة",
          data: [...Array(monthlyRevenue.length).fill(null), predictedValue], 
          fill: true,
          backgroundColor: predictedGradient,
          borderColor: "rgb(104, 180, 104)",
          borderWidth: 3,
          borderDash: [5, 5],
          pointBackgroundColor: "rgb(255, 255, 255)",
          pointBorderColor: "rgb(104, 180, 104)",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
        },
      ],
    };

    const config = {
      type: "line",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            rtl: true,
            labels: {
              font: {
                family: "'Tajawal', sans-serif",
                size: 14,
                weight: "bold",
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            rtl: true,
            bodyFont: {
              family: "'Tajawal', sans-serif",
              size: 14,
            },
            titleFont: {
              family: "'Tajawal', sans-serif",
              size: 16,
              weight: "bold",
            },
            padding: 12,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            cornerRadius: 12,
            displayColors: false,
            callbacks: {
              label: function (context) {
                const datasetLabel = context.dataset.label || "";
                if (datasetLabel.includes("المتوقعة")) {
                  return `الإيراد المتوقع: ${context.parsed.y.toLocaleString()} ل.س`;
                }
                return `الإيراد: ${context.parsed.y.toLocaleString()} ل.س`;
              },
            },
          },
          title: {
            display: true,
            text: "الإيرادات الشهرية ",
            font: {
              family: "'Tajawal', sans-serif",
              size: 18,
              weight: "bold",
            },
            padding: {
              top: 10,
              bottom: 30,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              font: {
                family: "'Tajawal', sans-serif",
                size: 12,
              },
              callback: function (value) {
                return value.toLocaleString() + " ل.س";
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                family: "'Tajawal', sans-serif",
                size: 12,
              },
            },
          },
        },
        animation: {
          duration: 1500,
          easing: "easeInOutQuart",
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        layout: {
          padding: {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20,
          },
        },
      },
    };

    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [monthlyRevenue, predictedRevenue]);

  return (
    <div style={{ position: "relative", height: "400px", width: "100%" }}>
      <canvas ref={canvasRef} id="MonthlyRevenueChart"></canvas>
    </div>
  );
};

export default MonthlyRevenueChart;
