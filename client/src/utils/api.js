import axios from "axios";

const api = axios.create({
  baseURL: "", // Backend base URL
});

export default api;
