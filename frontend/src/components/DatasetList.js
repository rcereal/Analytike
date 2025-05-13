import React, { useEffect, useState } from "react";
import axios from "axios";
import DatasetViewer from "./DatasetViewer";
import DatasetUpload from "./DatasetUpload";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";

const DatasetList = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    buscarDatasets(paginaAtual, search);
  }, [paginaAtual, search]);

  const buscarDatasets = async (pagina, searchTerm) => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/datasets-paginados/",
        {
          params: { page: pagina, search: searchTerm },
        }
      );
      setDatasets(response.data.results);
      setTotalPaginas(Math.ceil(response.data.count / 10));
    } catch (error) {
      console.error("Erro ao buscar datasets:", error);
    }
  };

  const irParaPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3 className="logo">📊 DataBoard</h3>
        <ul className="nav-links">
          <li className="active">📁 Datasets</li>
          <li>📈 Relatórios</li>
          <li>⚙️ Configurações</li>
        </ul>
      </div>

      <div className="main-content">
        {/* Navbar */}
        <div className="navbar">
          <input
            type="text"
            className="form-control search-bar"
            placeholder="🔍 Buscar datasets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="user-info">👤 Admin</span>
        </div>

        {/* Título e lista */}
        <div className="content">
          <h2 className="title">📁 Meus Datasets</h2>

          <div className="content">
            <h5>📤 Enviar novo Dataset</h5>
            <DatasetUpload />
          </div>

          <div className="dataset-grid">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className={`dataset-card ${
                  selectedDatasetId === dataset.id ? "selected" : ""
                }`}
                onClick={() => setSelectedDatasetId(dataset.id)}
              >
                <h5>{dataset.nome}</h5>
                <p className="text-muted">
                  Criado em: {new Date(dataset.criado_em).toLocaleDateString()}
                </p>
                <button className="btn btn-outline-primary btn-sm">
                  Visualizar
                </button>
              </div>
            ))}
          </div>

          {/* Paginação */}
          <div className="pagination-wrapper">
            <button
              className="btn btn-secondary me-2"
              onClick={() => irParaPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
            >
              Anterior
            </button>
            <span>
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              className="btn btn-secondary ms-2"
              onClick={() => irParaPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
            >
              Próxima
            </button>
          </div>

          {/* Viewer */}
          {selectedDatasetId && (
            <div className="viewer-section">
              <h4>🔍 Detalhes do Dataset</h4>
              <DatasetViewer datasetId={selectedDatasetId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetList;
