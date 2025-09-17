import { useEffect } from "react";
import { Chart } from "chart.js/auto";

const BeltDistributionChart = ({ beltDistribution }) => {
  useEffect(() => {
    if (!beltDistribution || beltDistribution.length === 0) return;

    const ctx = document.getElementById("BeltDistributionChart");

    const labels = beltDistribution.map((item) => item.beltName);
    const dataValues = beltDistribution.map((item) => item.membersCount);

    const colorMap = {
      "الحزام البرتقالي": {
        bg: "rgba(255, 159, 64, 0.7)",
        border: "rgba(255, 159, 64, 1)",
      },
      "الحزام البنفسجي": {
        bg: "rgba(153, 102, 255, 0.7)",
        border: "rgba(153, 102, 255, 1)",
      },
      "الحزام الأخضر": {
        bg: "rgba(75, 192, 192, 0.7)",
        border: "rgba(75, 192, 192, 1)",
      },
      "الحزام الأزرق": {
        bg: "rgba(54, 162, 235, 0.7)",
        border: "rgba(54, 162, 235, 1)",
      },
      "الحزام الأسود": { bg: "rgba(0, 0, 0, 0.7)", border: "rgba(0, 0, 0, 1)" },
      "الحزام الأصفر": {
        bg: "rgba(255, 205, 86, 0.7)",
        border: "rgba(255, 205, 86, 1)",
      },
      "الحزام البني": {
        bg: "rgba(139, 69, 19, 0.7)",
        border: "rgba(139, 69, 19, 1)",
      },
      "الحزام الأبيض": {
        bg: "rgba(255, 255, 255, 0.7)",
        border: "rgba(230, 230, 230, 1)",
      },
    };

    const data = {
      labels: labels,
      datasets: [
        {
          label: "عدد الأعضاء",
          data: dataValues,
          backgroundColor: labels.map(
            (label) => colorMap[label]?.bg || "rgba(200, 200, 200, 0.7)"
          ),
          borderColor: labels.map(
            (label) => colorMap[label]?.border || "rgba(200, 200, 200, 1)"
          ),
          borderWidth: 1,
        },
      ],
    };

    const config = {
      type: "doughnut",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            rtl: true,
            labels: {
              font: {
                family: "'Tajawal', sans-serif",
                size: 10,
              },
              padding: 10,
            },
          },
          title: {
            display: true,
            text: "توزيع الأحزمة",
            font: {
              family: "'Tajawal', sans-serif",
            },
          },
        },
      },
    };

    const chart = new Chart(ctx, config);

    return () => {
      chart.destroy();
    };
  }, [beltDistribution]);

  return <canvas id="BeltDistributionChart" height="250"></canvas>;
};

export default BeltDistributionChart;
