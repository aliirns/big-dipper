import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
        drawTicks: false,
      },
    },
    y: {
      ticks: {
        // Include a dollar sign in the ticks
        callback: function (value, index, values) {
          return value;
        },
      },
      grid: {
        display: true,
        borderDash: [8, 4],
        color: "#E4E4E4",
        drawBorder: false,
        drawTicks: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
      position: "top",
    },
    title: {
      display: false,
    },
  },
};

const labels = ["5/18", "5/19", "5/20", "5/21", "5/22", "Today"];
const data = {
  labels,
  datasets: [
    {
      label: "Total Earnings",
      fill: false,
      fillColor: "#0A004A",
      fillOpacity: 0.1,
      data: [
        234, 234, 234, 4234, 3, 234, 3, 42, 344, 23, 423, 42, 342, 4, 234, 23,
        423, 4, 234,
      ],
      borderColor: "#0A004A",
      backgroundColor: "rgba(6, 103, 235,0.1)",
    },
  ],
};

export default ActivityGraph = () => {
  return (
    <div className="activity-graph">
      <h4># of Sales</h4>
      <Line options={options} data={data} height="35px" />
    </div>
  );
};
