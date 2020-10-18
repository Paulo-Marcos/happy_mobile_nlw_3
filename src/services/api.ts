import axios from "axios";

const api = axios.create({
  baseURL: "https://deploy-happy-nlw-3.herokuapp.com",
});

export default api;
