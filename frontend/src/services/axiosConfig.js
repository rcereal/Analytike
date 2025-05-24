// import axios from "axios";

// const instance = axios.create({
//   baseURL: "http://localhost:8000/api/",
//   withCredentials: true,
// });

// instance.interceptors.request.use((config) => {
//   const getCookie = (name) => {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop().split(";").shift();
//   };
//   const csrfToken = getCookie("csrftoken");
//   if (csrfToken) {
//     config.headers["X-CSRFToken"] = csrfToken;
//   }
//   return config;
// });

// export default instance;
