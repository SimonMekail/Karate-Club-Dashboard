import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const PromotionRatesChart = ({ promotionRates }) => {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!promotionRates || promotionRates.length === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(54, 162, 235, 0.6)");
    gradient.addColorStop(1, "rgba(54, 162, 235, 0.1)");

    const labels = promotionRates.map((item) => {
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
      return `${monthNames[item.month - 1]} ${item.year}`;
    });

    const dataValues = promotionRates.map((item) => item.promotionsCount);

    const data = {
      labels: labels,
      datasets: [
        {
          label: "عدد الترقيات",
          data: dataValues,
          fill: true,
          backgroundColor: gradient,
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: "#fff",
          pointBorderColor: "rgb(54, 162, 235)",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
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
              usePointStyle: true,
              padding: 20,
              font: {
                family: "'Tajawal', sans-serif",
                size: 14,
              },
            },
          },
          title: {
            display: true,
            text: "عدد الترقيات الشهرية",
            font: {
              family: "'Tajawal', sans-serif",
              size: 16,
              weight: "500",
            },
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            titleFont: {
              family: "'Tajawal', sans-serif",
              size: 14,
              weight: "bold",
            },
            bodyFont: {
              family: "'Tajawal', sans-serif",
              size: 12,
            },
            padding: 12,
            usePointStyle: true,
            rtl: true,
            callbacks: {
              label: function (context) {
                return `الترقيات: ${context.parsed.y}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: "#8d8d8dff",
              font: {
                family: "'Tajawal', sans-serif",
                size: 12,
              },
            },
          },
          y: {
            beginAtZero: true,
            suggestedMin: 0,
            suggestedMax: Math.max(...dataValues) * 1.2, 
            grid: {
              color: "rgba(0,0,0,0.05)",
              drawBorder: false,
            },
            ticks: {
              color: "#8d8d8dff",
              font: {
                family: "'Tajawal', sans-serif",
                size: 12,
              },
              stepSize: Math.ceil(Math.max(...dataValues) / 5),
            },
            title: {
              display: true,
              text: "عدد الترقيات",
              font: {
                family: "'Tajawal', sans-serif",
                size: 14,
              },
            },
          },
        },
        elements: {
          line: {
            cubicInterpolationMode: "monotone",
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
  }, [promotionRates]);

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <canvas
        id="promotionRatesChart"
        ref={canvasRef}
        aria-label="عدد الترقيات الشهرية"
        role="img"
      ></canvas>
    </div>
  );
};

export default PromotionRatesChart;
