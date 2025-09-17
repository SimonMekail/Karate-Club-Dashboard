import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const NewMembersChart = ({ newMembersMonthly }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = document.getElementById("NewMembersChart");

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = newMembersMonthly.map((item) => {
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

    const dataValues = newMembersMonthly.map((item) => item.newSubscription);

    const data = {
      labels: labels,
      datasets: [
        {
          label: "اشتراكات جديدة",
          data: dataValues,
          backgroundColor: [
            "rgba(75, 192, 192, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(153, 102, 255, 0.7)",
            "rgba(255, 159, 64, 0.7)",
            "rgba(255, 99, 132, 0.7)",
            "rgba(34, 197, 94, 0.7)",
            "rgba(234, 179, 8, 0.7)",
            "rgba(217, 70, 239, 0.7)",
            "rgba(6, 182, 212, 0.7)",
            "rgba(239, 68, 68, 0.7)",
            "rgba(16, 185, 129, 0.7)",
            "rgba(139, 92, 246, 0.7)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(34, 197, 94, 1)",
            "rgba(234, 179, 8, 1)",
            "rgba(217, 70, 239, 1)",
            "rgba(6, 182, 212, 1)",
            "rgba(239, 68, 68, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(139, 92, 246, 1)",
          ],
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };

    const config = {
      type: "bar",
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
          title: {
            display: true,
            text: "الاشتراكات الجديدة شهرياً",
            font: {
              family: "'Tajawal', sans-serif",
              size: 16,
              weight: "bold",
            },
            padding: {
              bottom: 20,
            },
            color: "#4B5563", 
          },
          tooltip: {
            titleFont: {
              family: "'Tajawal', sans-serif",
              size: 14,
            },
            bodyFont: {
              family: "'Tajawal', sans-serif",
              size: 14,
            },
            padding: 10,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            cornerRadius: 6,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              font: {
                family: "'Tajawal', sans-serif",
              },
              stepSize: 1,
              color: "#8d8d8dff", 
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                family: "'Tajawal', sans-serif",
              },
              color: "#8d8d8dff", 
            },
          },
        },
        animation: {
          duration: 1000,
          easing: "easeOutQuart",
        },
      },
    };

    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [newMembersMonthly]);

  return (
    <div style={{ position: "relative", height: "400px", width: "100%" }}>
      <canvas id="NewMembersChart"></canvas>
    </div>
  );
};

export default NewMembersChart;
