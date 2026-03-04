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
  Filler,
  ChartOptions
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  title?: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
  height?: number;
}

const DEFAULT_COLORS = [
  {
    border: "rgb(59, 130, 246)",
    background: "rgba(59, 130, 246, 0.1)"
  },
  {
    border: "rgb(16, 185, 129)",
    background: "rgba(16, 185, 129, 0.1)"
  },
  {
    border: "rgb(245, 158, 11)",
    background: "rgba(245, 158, 11, 0.1)"
  },
  {
    border: "rgb(239, 68, 68)",
    background: "rgba(239, 68, 68, 0.1)"
  }
];

export function LineChart({
  title,
  labels,
  datasets,
  height = 300
}: LineChartProps) {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)"
        }
      }
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: !!title,
        text: title || "",
        font: {
          size: 16,
          weight: "bold"
        }
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        }
      }
    }
  };

  const data = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: dataset.borderColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length].border,
      backgroundColor: dataset.backgroundColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length].background,
      fill: dataset.fill !== undefined ? dataset.fill : true,
      tension: 0.4, // Smooth bezier curves
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: dataset.borderColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length].border,
      pointHoverBorderColor: "#fff",
      pointHoverBorderWidth: 2
    }))
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line options={options} data={data} />
    </div>
  );
}
