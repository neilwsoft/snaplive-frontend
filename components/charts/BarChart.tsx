"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  title?: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
  height?: number;
  stacked?: boolean;
}

export function BarChart({
  title,
  labels,
  datasets,
  height = 300,
  stacked = false
}: BarChartProps) {
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked,
        grid: {
          display: false
        }
      },
      y: {
        stacked,
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)"
        }
      }
    },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: "top" as const
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
        intersect: false
      }
    }
  };

  const data = {
    labels,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || "rgba(59, 130, 246, 0.5)",
      borderColor: dataset.borderColor || "rgb(59, 130, 246)",
      borderWidth: dataset.borderWidth || 1
    }))
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar options={options} data={data} />
    </div>
  );
}
