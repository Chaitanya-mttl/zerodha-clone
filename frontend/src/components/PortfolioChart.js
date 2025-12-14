import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PortfolioChart = ({ portfolio }) => {
  const data = {
    labels: portfolio.map(p => p.symbol),
    datasets: [
      {
        label: "Value",
        data: portfolio.map(p => p.currentValue),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
      }
    ]
  };

  return (
    <div style={{ width: "400px", margin: "auto" }}>
      <h3>Portfolio Distribution</h3>
      <Pie data={data} />
    </div>
  );
};

export default PortfolioChart;
