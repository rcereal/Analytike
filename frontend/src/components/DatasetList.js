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

  const excluirDataset = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este dataset?"
    );
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:8000/api/datasets/excluir/${id}/`);
      setDatasets((prev) => prev.filter((ds) => ds.id !== id));
      if (selectedDatasetId === id) setSelectedDatasetId(null);
      alert("✅ Dataset excluído com sucesso!");
    } catch (err) {
      alert("❌ Erro ao excluir dataset.");
      console.error("Erro ao excluir:", err);
    }
  };

  const gerarRelatorioPDF = async (datasetId, nome) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/relatorios/gerar-pdf/${datasetId}/`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `relatorio_${nome}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(
          "⚠️ Este dataset não possui dados númericos suficientes para gerar um relatório."
        );
      } else {
        alert("❌ Ocorreu um erro ao gerar o relatório. Tente novamente.");
      }
      console.error("Erro ao gerar PDF:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3 className="logo">📊 Analytike</h3>
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

              {search.trim() === "" && (
                <div className="upload-section">
                  {" "}
                  <h5>📤 Enviar novo Dataset</h5>
                  <DatasetUpload />
                </div>
              )}

              <div className="dataset-grid">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className={`dataset-card ${
                      selectedDatasetId === dataset.id ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedDatasetId(dataset.id);
                      setMostrarRelatorios(false);
                      setMostrarConfiguracoes(false);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <h5 title={dataset.nome}>{dataset.nome}</h5>
                    <p className="dataset-data">
                      Criado em:{" "}
                      {new Date(dataset.criado_em).toLocaleDateString()}
                    </p>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDatasetId(dataset.id);
                        setMostrarRelatorios(false);
                        setMostrarConfiguracoes(false);
                      }}
                    >
                      Visualizar
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        excluirDataset(dataset.id);
                      }}
                    >
                      Excluir
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
              <h4>📈 Relatórios Disponíveis</h4>
              <p className="mb-3">
                Selecione um dataset para gerar o PDF do relatório:
              </p>
              <div className="dataset-grid">
                {datasets.map((dataset) => (
                  <div key={dataset.id} className="dataset-card">
                    <h5 title={dataset.nome}>{dataset.nome}</h5>
                    <p className="dataset-data">
                      Criado em:{" "}
                      {new Date(dataset.criado_em).toLocaleDateString()}
                    </p>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() =>
                        gerarRelatorioPDF(dataset.id, dataset.nome)
                      }
                    >
                      📄 Gerar Relatório
                    </button>
                  </div>
                ))}
              </div>
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
