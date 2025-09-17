import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const PopularClassesChart = ({ popularClasses }) => {
  const chartRef = useRef(null);

  
  const colors = {
    background: [
      "rgba(101, 116, 255, 0.7)",
      "rgba(111, 213, 246, 0.7)",
      "rgba(120, 222, 200, 0.7)",
      "rgba(255, 203, 119, 0.7)",
      "rgba(255, 138, 119, 0.7)",
    ],
    border: [
      "rgb(101, 116, 255)",
      "rgb(111, 213, 246)",
      "rgb(120, 222, 200)",
      "rgb(255, 203, 119)",
      "rgb(255, 138, 119)",
    ],
    grid: "rgba(200, 200, 200, 0.2)",
    tooltipBg: "rgba(30, 30, 30, 0.9)",
  };

  useEffect(() => {
    if (!popularClasses || popularClasses.length === 0) return;

    const ctx = document.getElementById("PopularClassesChart");

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = popularClasses.map((item) => item.className);
    const dataValues = popularClasses.map((item) => item.totalSubscriptions);

    const data = {
      labels: labels,
      datasets: [
        {
          label: "عدد الاشتراكات",
          data: dataValues,
          backgroundColor: colors.background.slice(0, labels.length),
          borderColor: colors.border.slice(0, labels.length),
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };

    const config = {
      type: "bar",
      data: data,
      options: {
        indexAxis: "y",
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
              color: "#787878ff",
            },
          },
          title: {
            display: true,
            text: "أكثر الفصول شعبية",
            font: {
              family: "'Tajawal', sans-serif",
              size: 16,
              weight: "bold",
            },
            color: "#787878ff",
            padding: {
              bottom: 20,
            },
          },
          tooltip: {
            titleFont: {
              family: "'Tajawal', sans-serif",
              size: 14,
              weight: "bold",
            },
            bodyFont: {
              family: "'Tajawal', sans-serif",
              size: 14,
            },
            padding: 12,
            backgroundColor: colors.tooltipBg,
            cornerRadius: 6,
            displayColors: true,
            boxPadding: 4,
            bodyColor: "#fff",
            titleColor: "#fff",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: colors.grid,
              drawBorder: false,
            },
            ticks: {
              font: {
                family: "'Tajawal', sans-serif",
              },
              stepSize: 1,
              color: "#8d8d8dff",
            },
          },
          y: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              font: {
                family: "'Tajawal', sans-serif",
                weight: "500",
              },
              color: "#8d8d8dff",
            },
          },
        },
        animation: {
          duration: 1000,
          easing: "easeOutQuart",
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
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
  }, [popularClasses]);

  return (
    <div
      style={{
        position: "relative",
        height: "400px",
        width: "100%",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      }}
    >
      <canvas id="PopularClassesChart"></canvas>
    </div>
  );
};

export default PopularClassesChart;
