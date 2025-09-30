// import React, { useState } from "react";
// import api from "../services/axiosConfig";

// const DatasetUpload = ({ onUploadSuccess }) => {
//   const [arquivo, setArquivo] = useState(null);
//   const [nome, setNome] = useState("");
//   const [enviando, setEnviando] = useState(false);

//   const handleUpload = (e) => {
//     e.preventDefault();
//     setEnviando(true);

//     const formData = new FormData();
//     formData.append("arquivo", arquivo);
//     formData.append("nome", nome);

//     api
//       .post("upload-csv/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       })
//       .then(() => {
//         alert("✅ Arquivo enviado com sucesso!");
//         setNome("");
//         setArquivo(null);
//         document.querySelector('input[type="file"]').value = "";

//         if (onUploadSuccess) {
//           onUploadSuccess();
//         }
//       })
//       .catch((err) => {
//         console.error("Erro ao enviar arquivo:", err);
//         alert("❌ Falha no envio.");
//       })
//       .finally(() => {
//         setEnviando(false);
//       });
//   };

//   return (
//     <form onSubmit={handleUpload} className="mb-4">
//       <div className="mb-3">
//         <label className="form-label">Arquivo CSV:</label>
//         <input
//           type="file"
//           className="form-control"
//           accept=".csv"
//           onChange={(e) => {
//             const file = e.target.files[0];
//             if (file) {
//               setArquivo(file);
//               if (!nome) {
//                 setNome(file.name.replace(".csv", ""));
//               }
//             }
//           }}
//           required
//         />
//       </div>
//       <div className="mb-3">
//         <label className="form-label">Nome do Dataset:</label>
//         <input
//           type="text"
//           className="form-control"
//           value={nome}
//           onChange={(e) => setNome(e.target.value)}
//           required
//         />
//       </div>
//       <button type="submit" className="btn btn-primary" disabled={enviando}>
//         {enviando ? "Enviando..." : "Enviar"}
//       </button>
//     </form>
//   );
// };

// export default DatasetUpload;

// src/components/DatasetUpload.jsx

import React, { useState } from "react";
import api from "../services/axiosConfig";
import { useAuth } from "../hooks/useAuth"; // 🔑 Hook centralizado

const DatasetUpload = ({ onUploadSuccess }) => {
  const { logout } = useAuth(); // 🔑 acesso ao logout global
  const [arquivo, setArquivo] = useState(null);
  const [nome, setNome] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!arquivo) {
      alert("⚠️ Selecione um arquivo antes de enviar.");
      return;
    }

    setEnviando(true);

    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("nome", nome);

    try {
      await api.post("upload-csv/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Arquivo enviado com sucesso!");
      setNome("");
      setArquivo(null);
      document.querySelector('input[type="file"]').value = "";

      if (onUploadSuccess) {
        onUploadSuccess(); // 🔄 Atualiza lista no DatasetList
      }
    } catch (err) {
      console.error("Erro ao enviar arquivo:", err);
      if (err.response?.status === 401) {
        alert("⚠️ Sessão expirada. Faça login novamente.");
        logout(); // 🔑 Se o token expirou, faz logout automático
      } else {
        alert("❌ Falha no envio.");
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="mb-4">
      <div className="mb-3">
        <label className="form-label">Arquivo CSV:</label>
        <input
          type="file"
          className="form-control"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setArquivo(file);
              if (!nome) {
                setNome(file.name.replace(".csv", ""));
              }
            }
          }}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Nome do Dataset:</label>
        <input
          type="text"
          className="form-control"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={enviando}>
        {enviando ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
};

export default DatasetUpload;
