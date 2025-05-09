import React, { useState, useEffect } from "react";
import axios from "axios";
import DatasetChart from "./DatasetChart";

const DatasetViewer = ({ datasetId }) => {
  // Inicializando com arrays vazios para evitar erros
  const [dados, setDados] = useState([]);
  const [colunas, setColunas] = useState([]);
  const [analise, setAnalise] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/visualizar-dataset/${datasetId}/`)
      .then((res) => {
        console.log(res.data);
        setColunas(Array.isArray(res.data.colunas) ? res.data.colunas : []);
        setDados(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados do dataset:", err);
      });

    axios
      .get(`http://localhost:8000/api/analise/${datasetId}/`)
      .then((res) => {
        setAnalise(res.data);
      })
      .catch((err) => {
        console.error("Erro ao buscar análise do dataset:", err);
        if (err.response) {
          // Se o erro tiver uma resposta, você pode verificar o status e o conteúdo
          console.error("Erro na resposta da API:", err.response);
        }
      });
  });

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Dashboard de Análise de Dados</h3>

      <div className="card mb-4 shadow-sm p-3">
        <h5 className="mb-3">Gráfico de Visualização</h5>
        <DatasetChart dados={dados} colunas={colunas} />
      </div>

      <div className="card mb-4 shadow-sm p-3">
        <h5 className="mb-3">Tabela do Dataset</h5>
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="thead-dark">
              <tr>
                {colunas.length > 0 ? (
                  colunas.map((coluna, index) => <th key={index}>{coluna}</th>)
                ) : (
                  <th colSpan="100%">Nenhuma coluna disponível</th>
                )}
              </tr>
            </thead>
            <tbody>
              {dados.length > 0 ? (
                dados.map((linha, index) => (
                  <tr key={index}>
                    {colunas.map((coluna) => (
                      <td key={coluna}>{linha[coluna]}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={colunas.length}>Nenhum dado disponível</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {analise && analise.analises && (
        <div className="card shadow-sm p-3 mb-4">
          <h5 className="mb-3">Análise Estatística</h5>
          {Object.entries(analise.analises).map(([coluna, stats]) => (
            <div key={coluna} className="mb-3">
              <h6>
                <strong>{coluna}</strong>
              </h6>
              <ul>
                {Object.entries(stats).map(([stat, valor]) => (
                  <li key={stat}>
                    {stat}:{" "}
                    {typeof valor === "number" ? valor.toFixed(2) : valor}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatasetViewer;
