// Seu código em src/components/DatasetList.jsx

import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";
import DatasetViewer from "./DatasetViewer";
import DatasetUpload from "./DatasetUpload";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";

const DatasetList = ({ onLogout }) => {
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

  // 🔑 NOVO ESTADO: controla a tela de carregamento
  const [isLoading, setIsLoading] = useState(true);

  // ➡️ Combina a lógica de CSRF, sessão e busca de dados em um só lugar
  useEffect(() => {
    const setupSessionAndFetchData = async () => {
      setIsLoading(true); // Inicia o estado de carregamento
      try {
        // 1. Garante que o cookie CSRF está setado
        await api.get("csrf/");
        console.log("✅ CSRF cookie setado com sucesso");

        // 2. Verifica a autenticação do usuário
        const response = await api.get("verificar-sessao/");
        const { autenticado } = response.data;

        if (!autenticado) {
          console.log("Sessão expirada. Redirecionando para login.");
          onLogout(); // Se não estiver autenticado, redireciona
        } else {
          console.log("Sessão ativa.");
          // 3. Só busca os datasets se a sessão estiver ativa
          buscarDatasets(paginaAtual, search);
        }
      } catch (err) {
        console.error("❌ Erro fatal no setup da sessão:", err);
        // Em caso de qualquer erro no processo, assume-se que a sessão é inválida
        onLogout();
      } finally {
        // 4. Desativa o estado de carregamento no final
        setIsLoading(false);
      }
    };

    // Inicia o processo quando o componente é montado
    setupSessionAndFetchData();

    // As dependências 'paginaAtual' e 'search' agora não são necessárias neste useEffect,
    // pois a função 'buscarDatasets' já será chamada no lugar certo (dentro do try/catch).
  }, [onLogout]);

  // Remover este useEffect duplicado, pois a sua lógica foi movida
  // useEffect(() => {
  //   buscarDatasets(paginaAtual, search);
  // }, [paginaAtual, search]);

  useEffect(() => {
    if (temaEscuro) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("tema", "escuro");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("tema", "claro");
    }
  }, [temaEscuro]);

  // O restante das funções permanece o mesmo
  const buscarDatasets = async (pagina, searchTerm) => {
    try {
      const response = await api.get("datasets-paginados/", {
        params: { page: pagina, search: searchTerm },
      });
      setDatasets(response.data.results);
      setTotalPaginas(Math.ceil(response.data.count / 10));
    } catch (error) {
      console.error("Erro ao buscar datasets:", error);
    }
  };

  const irParaPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagala <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("logout/");
      onLogout();
    } catch (error) {
      console.error("Erro ao deslogar:", error.response || error);
      alert("❌ Erro ao fazer logout.");
    }
  };

  const excluirDataset = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este dataset?"
    );
    if (!confirmar) return;

    try {
      await api.delete(`/datasets/excluir/${id}/`);
      setDatasets((prev) => prev.filter((ds) => ds.id !== id));
      if (selectedDatasetId === id) setSelectedDatasetId(null);
      alert("✅ Dataset excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir dataset:", err);
      if (err.response) {
        alert(
          `❌ Erro ao excluir dataset: ${err.response.status} - ${
            err.response.data?.erro || err.response.statusText
          }`
        );
      } else {
        alert("❌ Erro ao excluir dataset (falha de rede).");
      }
    }
  };

  const gerarRelatorioPDF = async (datasetId, nome) => {
    try {
      const response = await api.get(`relatorios/gerar-pdf/${datasetId}/`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `relatorio_${nome}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (error.response?.status === 400) {
        alert(
          "⚠️ Dataset sem dados numéricos suficientes para gerar relatório."
        );
      } else {
        alert("❌ Erro ao gerar relatório.");
      }
      console.error("Erro ao gerar PDF:", error);
    }
  };

  // ➡️ RENDERIZAÇÃO CONDICIONAL
  // Se estiver carregando, mostra a tela de loading
  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3">Carregando...</p>
      </div>
    );
  }

  // Se o carregamento estiver completo, mostra o conteúdo principal
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
              setMostrarRelatorios(false);
              setMostrarConfiguracoes(false);
              setSelectedDatasetId(null);
            }}
          >
            📁 Datasets
          </li>
          <li
            className={mostrarRelatorios ? "active" : ""}
            onClick={() => {
              setMostrarRelatorios(true);
              setMostrarConfiguracoes(false);
              setSelectedDatasetId(null);
            }}
          >
            📈 Relatórios
          </li>
          <li
            className={mostrarConfiguracoes ? "active" : ""}
            onClick={() => {
              setMostrarConfiguracoes(true);
              setMostrarRelatorios(false);
              setSelectedDatasetId(null);
            }}
          >
            ⚙️ Configurações
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="navbar">
          <input
            type="text"
            className="form-control search-bar"
            placeholder="🔍 Buscar datasets..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedDatasetId(null);
            }}
          />
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              👤 Admin
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="dropdownMenuButton"
            >
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => alert("Ver perfil em breve!")}
                >
                  Ver Perfil
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="content">
          {!mostrarRelatorios && !mostrarConfiguracoes && (
            <>
              <h2 className="title">📁 Meus Datasets</h2>

              {search.trim() === "" && (
                <div className="upload-section">
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

              {selectedDatasetId && (
                <div className="viewer-section">
                  <h4>🔍 Detalhes do Dataset</h4>
                  <DatasetViewer datasetId={selectedDatasetId} />
                </div>
              )}
            </>
          )}

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
