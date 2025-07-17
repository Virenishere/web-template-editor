import axios from "axios";
//added env test 
const baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"; 

const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
