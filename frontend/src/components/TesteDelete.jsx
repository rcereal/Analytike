import React, { useState } from "react";
import api from "../services/axiosConfig";
import Cookies from "js-cookie";

const TestDelete = () => {
  const [datasetId, setDatasetId] = useState("");
  const [message, setMessage] = useState("");

  const handleLoginAndTestDelete = async () => {
    setMessage("Testando login...");
    try {
      const loginData = { username: "seu_usuario", password: "sua_senha" };
      await api.post("login/", loginData);

      setMessage(
        "Login bem-sucedido! CSRF E SessionID obtidos. Tentando excluir..."
      );

      const csrfToken = Cookies.get("csrftoken");
      const sessionid = Cookies.get("sessionid");

      const response = await api.delete(`/datasets/excluir/${datasetId}/`, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
      });

      setMessage(`Exclusao bem-sucedida! Status: ${response.status}`);
      console.log("Exclusão bem-sucedida:", response.data);
    } catch (error) {
      setMessage(
        `Falha na operaçao: ${error.response?.status} - ${
          error.response?.data?.erro || "Erro desconhecido"
        }`
      );
      console.error("Erro completo:", error.response);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        margin: "20px",
        borderRadius: "8px",
      }}
    >
      <h4>Teste de Exclusão (Isolado)</h4>
      <p>Este componente testa o fluxo de login e exclusão em sequência.</p>
      <input
        type="text"
        placeholder="ID do Dataset"
        value={datasetId}
        onChange={(e) => setDatasetId(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <button onClick={handleLoginAndTestDelete}>Login e Excluir</button>
      <p style={{ marginTop: "10px", fontWeight: "bold" }}>{message}</p>
    </div>
  );
};

export default TestDelete;
