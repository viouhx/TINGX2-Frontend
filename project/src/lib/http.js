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

// ★ 요청마다 로컬 토큰을 Authorization 헤더로 추가 (있으면)
http.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[HTTP ERROR]", err?.response || err);
    //상태코드별 정리, 전역 토스트/로그아웃 처리 등
    return Promise.reject(err);
  }
);

export default http;
