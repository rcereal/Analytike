import React, { useEffect, useState } from "react";
import axios from "axios";
import DatasetViewer from "./DatasetViewer";

const DatasetList = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/datasets-list/")
      .then((response) => {
        setDatasets(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar datasets:", error);
      });
  }, []);

  return (
    <div className="container mt-4">
      <h2>Datasets Enviados</h2>
      <ul className="list-group">
        {datasets.map((dataset) => (
          <li
            key={dataset.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{dataset.nome}</strong> -{" "}
              {new Date(dataset.criado_em).toLocaleString()}
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setSelectedDatasetId(dataset.id)}
            >
              Visualizar
            </button>
          </li>
        ))}
      </ul>

      {selectedDatasetId && <DatasetViewer datasetId={selectedDatasetId} />}
    </div>
  );
};

export default DatasetList;
