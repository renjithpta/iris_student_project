import axios from "axios";

const api = axios.create({
  baseURL: "http://145.239.29.94:4000"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  

  if (token){
    config.headers.Authorization = `${token}`;
  }
    return config;
});

export default api;