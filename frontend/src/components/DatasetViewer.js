import React, { useState, useEffect } from "react";
import axios from "axios";

const DatasetViewer = ({ datasetId }) => {
  const [dados, setDados] = useState([]);
  const [colunas, setColunas] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/visualizar-dataset/${datasetId}/`)
      .then((res) => {
        console.log("Resposta da API:", res.data);
        setColunas(Array.isArray(res.data.colunas) ? res.data.colunas : []);
        setDados(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados do dataset:", err);
      });
  }, [datasetId]);

  return (
    <div className="mt-4">
      <h4>Visualização do Dataset</h4>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="thead-dark">
            <tr>
              {Array.isArray(colunas) &&
                colunas.map((coluna, index) => <th key={index}>{coluna}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(dados) &&
              dados.map((linha, index) => (
                <tr key={index}>
                  {colunas.map((coluna) => (
                    <td key={coluna}>{linha[coluna]}</td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatasetViewer;
