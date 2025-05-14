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
  const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);
  const [mostrarRelatorios, setMostrarRelatorios] = useState(false);
  const [temaEscuro, setTemaEscuro] = useState(
    localStorage.getItem("tema") === "escuro"
  );

  useEffect(() => {
    buscarDatasets(paginaAtual, search);
  }, [paginaAtual, search]);

  useEffect(() => {
    if (temaEscuro) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("tema", "escuro");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("tema", "claro");
    }
  }, [temaEscuro]);

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
          <li
            className={
              !mostrarRelatorios && !mostrarConfiguracoes ? "active" : ""
            }
            onClick={() => {
              setMostrarRelatorios(false); // 🔧 Voltar para datasets
              setMostrarConfiguracoes(false);
              setSelectedDatasetId(null);
            }}
          >
            📁 Datasets
          </li>
          <li
            className={mostrarRelatorios ? "active" : ""}
            onClick={() => {
              setMostrarRelatorios(true); // 🔧 Exibir relatórios
              setMostrarConfiguracoes(false);
              setSelectedDatasetId(null);
            }}
          >
            📈 Relatórios
          </li>
          <li
            className={mostrarConfiguracoes ? "active" : ""}
            onClick={() => {
              setMostrarConfiguracoes(true); // 🔧 Exibir configurações
              setMostrarRelatorios(false);
              setSelectedDatasetId(null);
            }}
          >
            ⚙️ Configurações
          </li>
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

        {/* Conteúdo Principal */}
        <div className="content">
          {/* Bloco Datasets */}
          {!mostrarRelatorios && !mostrarConfiguracoes && (
            <>
              <h2 className="title">📁 Meus Datasets</h2>

              <div className="upload-section">
                {" "}
                {/* 🔧 Renomeado para evitar repetição de classe */}
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
                    onClick={() => {
                      setSelectedDatasetId(dataset.id);
                      setMostrarRelatorios(false); // 🔧 Garante que só um bloco apareça
                      setMostrarConfiguracoes(false);
                    }}
                    role="button" // 🔧 Acessibilidade
                    tabIndex={0} // 🔧 Acessibilidade
                  >
                    <h5>{dataset.nome}</h5>
                    <p className="text-muted">
                      Criado em:{" "}
                      {new Date(dataset.criado_em).toLocaleDateString()}
                    </p>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation(); // 🔧 Evita conflito com onClick do card
                        setSelectedDatasetId(dataset.id);
                        setMostrarRelatorios(false);
                        setMostrarConfiguracoes(false);
                      }}
                    >
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
            </>
          )}

          {/* Bloco de Relatórios */}
          {mostrarRelatorios && (
            <div className="relatorios">
              <h4>📈 Relatórios</h4>
              <p>Em breve você poderá gerar relatórios aqui.</p>
            </div>
          )}

          {/* Bloco de Configurações */}
          {mostrarConfiguracoes && (
            <div className="configuracoes">
              <h4>⚙️ Configurações</h4>
              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="temaEscuroSwitch"
                  checked={temaEscuro}
                  onChange={() => setTemaEscuro(!temaEscuro)}
                />
                <label className="form-check-label" htmlFor="temaEscuroSwitch">
                  Tema Escuro
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetList;
