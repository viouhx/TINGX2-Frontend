// src/lib/http.js
import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:8080"; // ← 로컬 기본값 유지

const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 쿠키 인증 필수
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[HTTP ERROR]", err?.response || err);
    return Promise.reject(err);
  }
);

export default http;
