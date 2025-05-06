import React, { useEffect, useState } from "react";
import axios from "axios";
import DatasetViewer from "./DatasetViewer";

const DatasetList = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    buscarDatasets(paginaAtual, search);
  }, [paginaAtual, search]);

  const buscarDatasets = async (pagina, search) => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/datasets-paginados/",
        {
          params: {
            page: pagina,
            search: search, // Usando o parâmetro 'search' para busca por nome
          },
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
    <div className="container mt-4">
      <h2>Datasets Enviados</h2>

      {/* Filtro de nome */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Buscar por nome..."
          value={search} // Usando 'search' para busca por nome
          onChange={(e) => {
            setPaginaAtual(1); // Resetando a página para 1 quando o nome mudar
            setSearch(e.target.value); // Atualizando o filtro de busca
          }}
        />
      </div>

      {/* Lista de datasets */}
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

      {/* Paginação */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-secondary"
          disabled={paginaAtual === 1}
          onClick={() => irParaPagina(paginaAtual - 1)}
        >
          Anterior
        </button>
        <span>
          Página {paginaAtual} de {totalPaginas}
        </span>
        <button
          className="btn btn-secondary"
          disabled={paginaAtual === totalPaginas}
          onClick={() => irParaPagina(paginaAtual + 1)}
        >
          Próxima
        </button>
      </div>

      {selectedDatasetId && <DatasetViewer datasetId={selectedDatasetId} />}
    </div>
  );
};

export default DatasetList;
