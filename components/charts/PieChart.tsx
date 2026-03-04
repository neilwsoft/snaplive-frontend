"use client";

import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  title?: string;
  labels: string[];
  data: number[];
  backgroundColor?: string[];
  height?: number;
  showPercentage?: boolean;
}

const DEFAULT_COLORS = [
  "rgba(59, 130, 246, 0.8)",  // Blue
  "rgba(16, 185, 129, 0.8)",  // Green
  "rgba(245, 158, 11, 0.8)",  // Yellow
  "rgba(239, 68, 68, 0.8)",   // Red
  "rgba(139, 92, 246, 0.8)",  // Purple
  "rgba(236, 72, 153, 0.8)",  // Pink
  "rgba(20, 184, 166, 0.8)",  // Teal
  "rgba(251, 146, 60, 0.8)"   // Orange
];

export function PieChart({
  title,
  labels,
  data,
  backgroundColor = DEFAULT_COLORS,
  height = 300,
  showPercentage = true
}: PieChartProps) {
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          padding: 15,
          font: {
            size: 12
          },
          color: 'rgb(107, 114, 128)', // Gray-500 for better readability
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              const dataset = data.datasets[0];
              const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);

              return data.labels.map((label, i) => {
                const value = (dataset.data as number[])[i] || 0;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";

                return {
                  text: showPercentage ? `${label} (${percentage}%)` : `${label} (${value})`,
                  fillStyle: Array.isArray(dataset.backgroundColor)
                    ? dataset.backgroundColor[i]
                    : dataset.backgroundColor as string,
                  fontColor: 'rgb(107, 114, 128)', // Gray-500 for text color
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
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
        callbacks: {
          label: function(context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: "60%" // Makes it a doughnut chart
  };

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor: backgroundColor.map(color => color.replace('0.8', '1')),
        borderWidth: 2
      }
    ]
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Doughnut options={options} data={chartData} />
    </div>
  );
}
