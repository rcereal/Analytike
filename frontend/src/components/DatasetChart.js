import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DatasetChart = ({ dados, colunas }) => {
  if (!dados || dados.length === 0 || !colunas || colunas.length === 0) {
    return <p>Nenhum dado disponível para exibir o gráfico.</p>;
  }

  const campoNumerico = colunas.find(
    (coluna) => typeof dados[0][coluna] === "number"
  );
  const campoLabel = colunas.find(
    (coluna) => typeof dados[0][coluna] === "string"
  );

  if (!campoNumerico || !campoLabel) {
    return (
      <p>
        Não há colunas numéricas e textuais suficientes para gerar o gráfico.
      </p>
    );
  }

  const chartData = {
    labels: dados.map((linha) => linha[campoLabel]),
    datasets: [
      {
        label: campoNumerico,
        data: dados.map((linha) => linha[campoNumerico]),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Gráfico de ${campoNumerico}` },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
};

export default DatasetChart;
