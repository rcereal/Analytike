// import React, { useEffect, useState } from "react";
// import api from "../services/axiosConfig";
// import DatasetViewer from "./DatasetViewer";
// import DatasetUpload from "./DatasetUpload";
// import { useAuth } from "../hooks/useAuth"; // 🔑 Hook centralizado
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./Dashboard.css";

// const DatasetList = () => {
//   const { user, logout } = useAuth(); // 🔑 pega usuário e logout do hook
//   const [datasets, setDatasets] = useState([]);
//   const [selectedDatasetId, setSelectedDatasetId] = useState(null);
//   const [paginaAtual, setPaginaAtual] = useState(1);
//   const [totalPaginas, setTotalPaginas] = useState(1);
//   const [search, setSearch] = useState("");
//   const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);
//   const [mostrarRelatorios, setMostrarRelatorios] = useState(false);
//   const [temaEscuro, setTemaEscuro] = useState(
//     localStorage.getItem("tema") === "escuro"
//   );
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     buscarDatasets(paginaAtual, search);
//   }, [paginaAtual, search]);

//   useEffect(() => {
//     if (temaEscuro) {
//       document.body.classList.add("dark-theme");
//       localStorage.setItem("tema", "escuro");
//     } else {
//       document.body.classList.remove("dark-theme");
//       localStorage.setItem("tema", "claro");
//     }
//   }, [temaEscuro]);

//   const buscarDatasets = async (pagina, searchTerm) => {
//     setIsLoading(true);
//     try {
//       const response = await api.get("datasets-paginados/", {
//         params: { page: pagina, search: searchTerm },
//       });
//       setDatasets(response.data.results);
//       setTotalPaginas(Math.ceil(response.data.count / 10));
//     } catch (error) {
//       if (error.response?.status === 401) {
//         console.warn("⚠️ Token expirado ou inválido. Fazendo logout.");
//         logout();
//       } else {
//         console.error("Erro ao buscar datasets:", error);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const irParaPagina = (novaPagina) => {
//     if (novaPagina >= 1 && novaPagina <= totalPaginas) {
//       setPaginaAtual(novaPagina);
//     }
//   };

//   const excluirDataset = async (id) => {
//     const confirmar = window.confirm(
//       "Tem certeza que deseja excluir este dataset?"
//     );
//     if (!confirmar) return;

//     try {
//       await api.delete(`/datasets/excluir/${id}/`);
//       setDatasets((prev) => prev.filter((ds) => ds.id !== id));
//       if (selectedDatasetId === id) setSelectedDatasetId(null);
//       alert("✅ Dataset excluído com sucesso!");
//     } catch (err) {
//       console.error("Erro ao excluir dataset:", err);
//       if (err.response) {
//         alert(
//           `❌ Erro ao excluir dataset: ${err.response.status} - ${
//             err.response.data?.erro || err.response.statusText
//           }`
//         );
//       } else {
//         alert("❌ Erro ao excluir dataset (falha de rede).");
//       }
//     }
//   };

//   const gerarRelatorioPDF = async (datasetId, nome) => {
//     try {
//       const response = await api.get(`relatorios/gerar-pdf/${datasetId}/`, {
//         responseType: "blob",
//       });

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `relatorio_${nome}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (error) {
//       if (error.response?.status === 400) {
//         alert(
//           "⚠️ Dataset sem dados numéricos suficientes para gerar relatório."
//         );
//       } else {
//         alert("❌ Erro ao gerar relatório.");
//       }
//       console.error("Erro ao gerar PDF:", error);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div
//         className="d-flex justify-content-center align-items-center"
//         style={{ height: "100vh" }}
//       >
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//         <p className="ms-3">Carregando...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard-container">
//       <div className="sidebar">
//         <h3 className="logo">📊 Analytike</h3>
//         <ul className="nav-links">
//           <li
//             className={
//               !mostrarRelatorios && !mostrarConfiguracoes ? "active" : ""
//             }
//             onClick={() => {
//               setMostrarRelatorios(false);
//               setMostrarConfiguracoes(false);
//               setSelectedDatasetId(null);
//             }}
//           >
//             📁 Datasets
//           </li>
//           <li
//             className={mostrarRelatorios ? "active" : ""}
//             onClick={() => {
//               setMostrarRelatorios(true);
//               setMostrarConfiguracoes(false);
//               setSelectedDatasetId(null);
//             }}
//           >
//             📈 Relatórios
//           </li>
//           <li
//             className={mostrarConfiguracoes ? "active" : ""}
//             onClick={() => {
//               setMostrarConfiguracoes(true);
//               setMostrarRelatorios(false);
//               setSelectedDatasetId(null);
//             }}
//           >
//             ⚙️ Configurações
//           </li>
//         </ul>
//       </div>

//       <div className="main-content">
//         <div className="navbar">
//           <input
//             type="text"
//             className="form-control search-bar"
//             placeholder="🔍 Buscar datasets..."
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setSelectedDatasetId(null);
//             }}
//           />
//           <div className="dropdown">
//             <button
//               className="btn btn-outline-secondary dropdown-toggle"
//               type="button"
//               id="dropdownMenuButton"
//               data-bs-toggle="dropdown"
//               aria-expanded="false"
//             >
//               👤 {user?.username || "Usuário"}
//             </button>
//             <ul
//               className="dropdown-menu dropdown-menu-end"
//               aria-labelledby="dropdownMenuButton"
//             >
//               <li>
//                 <button
//                   className="dropdown-item"
//                   onClick={() => alert("Ver perfil em breve!")}
//                 >
//                   Ver Perfil
//                 </button>
//               </li>
//               <li>
//                 <button className="dropdown-item text-danger" onClick={logout}>
//                   Sair
//                 </button>
//               </li>
//             </ul>
//           </div>
//         </div>

//         <div className="content">
//           {!mostrarRelatorios && !mostrarConfiguracoes && (
//             <>
//               <h2 className="title">📁 Meus Datasets</h2>

//               {search.trim() === "" && (
//                 <div className="upload-section">
//                   <h5>📤 Enviar novo Dataset</h5>
//                   <DatasetUpload
//                     onUploadSuccess={() => buscarDatasets(1, "")}
//                   />
//                 </div>
//               )}

//               <div className="dataset-grid">
//                 {datasets.map((dataset) => (
//                   <div
//                     key={dataset.id}
//                     className={`dataset-card ${
//                       selectedDatasetId === dataset.id ? "selected" : ""
//                     }`}
//                     onClick={() => {
//                       setSelectedDatasetId(dataset.id);
//                       setMostrarRelatorios(false);
//                       setMostrarConfiguracoes(false);
//                     }}
//                     role="button"
//                     tabIndex={0}
//                   >
//                     <h5 title={dataset.nome}>{dataset.nome}</h5>
//                     <p className="dataset-data">
//                       Criado em:{" "}
//                       {new Date(dataset.criado_em).toLocaleDateString()}
//                     </p>
//                     <button
//                       className="btn btn-outline-primary btn-sm"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setSelectedDatasetId(dataset.id);
//                       }}
//                     >
//                       Visualizar
//                     </button>
//                     <button
//                       className="btn btn-outline-danger btn-sm ms-2"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         excluirDataset(dataset.id);
//                       }}
//                     >
//                       Excluir
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               <div className="pagination-wrapper">
//                 <button
//                   className="btn btn-secondary me-2"
//                   onClick={() => irParaPagina(paginaAtual - 1)}
//                   disabled={paginaAtual === 1}
//                 >
//                   Anterior
//                 </button>
//                 <span>
//                   Página {paginaAtual} de {totalPaginas}
//                 </span>
//                 <button
//                   className="btn btn-secondary ms-2"
//                   onClick={() => irParaPagina(paginaAtual + 1)}
//                   disabled={paginaAtual === totalPaginas}
//                 >
//                   Próxima
//                 </button>
//               </div>

//               {selectedDatasetId && (
//                 <div className="viewer-section">
//                   <h4>🔍 Detalhes do Dataset</h4>
//                   <DatasetViewer datasetId={selectedDatasetId} />
//                 </div>
//               )}
//             </>
//           )}

//           {mostrarRelatorios && (
//             <div className="relatorios">
//               <h4>📈 Relatórios Disponíveis</h4>
//               <p className="mb-3">
//                 Selecione um dataset para gerar o PDF do relatório:
//               </p>
//               <div className="dataset-grid">
//                 {datasets.map((dataset) => (
//                   <div key={dataset.id} className="dataset-card">
//                     <h5 title={dataset.nome}>{dataset.nome}</h5>
//                     <p className="dataset-data">
//                       Criado em:{" "}
//                       {new Date(dataset.criado_em).toLocaleDateString()}
//                     </p>
//                     <button
//                       className="btn btn-success btn-sm"
//                       onClick={() =>
//                         gerarRelatorioPDF(dataset.id, dataset.nome)
//                       }
//                     >
//                       📄 Gerar Relatório
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {mostrarConfiguracoes && (
//             <div className="configuracoes">
//               <h4>⚙️ Configurações</h4>
//               <div className="form-check form-switch mt-2">
//                 <input
//                   className="form-check-input"
//                   type="checkbox"
//                   id="temaEscuroSwitch"
//                   checked={temaEscuro}
//                   onChange={() => setTemaEscuro(!temaEscuro)}
//                 />
//                 <label className="form-check-label" htmlFor="temaEscuroSwitch">
//                   Tema Escuro
//                 </label>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DatasetList;

import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";
import DatasetViewer from "./DatasetViewer";
import DatasetUpload from "./DatasetUpload";
import { useAuth } from "../hooks/useAuth";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";

const DatasetList = () => {
  const { user, logout } = useAuth();
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
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(true);
    try {
      const response = await api.get("datasets-paginados/", {
        params: { page: pagina, search: searchTerm },
      });
      setDatasets(response.data.results);
      setTotalPaginas(Math.ceil(response.data.count / 10));
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn("⚠️ Token expirado ou inválido. Fazendo logout.");
        logout();
      } else {
        console.error("Erro ao buscar datasets:", error);
      }
    } finally {
      setIsLoading(false);
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
            📁 Arquivos de Dados
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
              👤 {user?.username || "Usuário"}
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
                <button className="dropdown-item text-danger" onClick={logout}>
                  Sair
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="content">
          {!mostrarRelatorios && !mostrarConfiguracoes && (
            <>
              <h2 className="title">📁 Meus Arquivos de Dados</h2>

              {search.trim() === "" && (
                <div className="upload-section mb-4">
                  <h5>📤 Enviar novo Arquivo de Dados</h5>
                  <DatasetUpload
                    onUploadSuccess={() => buscarDatasets(1, "")}
                  />
                </div>
              )}

              <div className="dataset-list">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="dataset-item"
                    onClick={() => setSelectedDatasetId(dataset.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="info">
                      <strong>{dataset.nome}</strong>
                      <span>
                        Criado em:{" "}
                        {new Date(dataset.criado_em).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="actions">
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
                        className="btn btn-outline-danger btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          excluirDataset(dataset.id);
                        }}
                      >
                        Excluir
                      </button>
                    </div>
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
                  <h4>🔍 Detalhes do Arquivo de Dados</h4>
                  <DatasetViewer datasetId={selectedDatasetId} />
                </div>
              )}
            </>
          )}

          {mostrarRelatorios && (
            <div className="relatorios">
              <h4>📈 Relatórios Disponíveis</h4>
              <p className="mb-3">
                Selecione um arquivo de dados para gerar o PDF do relatório:
              </p>
              <div className="dataset-list">
                {datasets.map((dataset) => (
                  <div key={dataset.id} className="dataset-item">
                    <div className="info">
                      <strong>{dataset.nome}</strong>
                      <span>
                        Criado em:{" "}
                        {new Date(dataset.criado_em).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          gerarRelatorioPDF(dataset.id, dataset.nome)
                        }
                      >
                        📄 Gerar Relatório
                      </button>
                    </div>
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
