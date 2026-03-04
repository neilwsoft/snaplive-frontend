"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { LatencyDataPoint } from "@/lib/types/statistics";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LatencyChartProps {
  data: LatencyDataPoint[];
  platformColor: string;
}

export function LatencyChart({ data, platformColor }: LatencyChartProps) {
  const chartData = {
    labels: data.map((point) => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }),
    datasets: [
      {
        label: "Latency (ms)",
        data: data.map((point) => point.latency),
        borderColor: platformColor,
        backgroundColor: platformColor + "20", // 20% opacity
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: platformColor,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#27272a",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `${context.parsed.y}ms`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 10,
          },
          maxRotation: 0,
        },
      },
      y: {
        grid: {
          color: "#e2e8f0",
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 10,
          },
          callback: function (value) {
            return `${value}ms`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-32">
      <Line data={chartData} options={options} />
    </div>
  );
}
