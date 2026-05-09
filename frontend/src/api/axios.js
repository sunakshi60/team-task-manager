import axios from "axios";

const API = axios.create({
    baseURL: "https://team-task-manager-production-2689.up.railway.app/api",
});

API.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
    return config;
});

export default API;
