// src/lib/http.js
import axios from "axios";

// 1) 환경변수에서 베이스 URL 읽기 (CRA는 REACT_APP_ 접두사 필수)
const API_BASE =
  process.env.REACT_APP_API_BASE || ""; // 예: https://tingting.shop/api  또는 https://api.tingting.shop

// 2) axios 인스턴스
const http = axios.create({
  baseURL: API_BASE,           // ★ 절대 URL 그대로 사용
  withCredentials: true,       // 쿠키/세션 사용 시
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// 3) 요청 인터셉터: 토큰만 붙이고, 절대 URL은 건드리지 않음
http.interceptors.request.use((config) => {
  // (선택) 토큰 헤더
 // const token =
    //localStorage.getItem("accessToken") ||
    //sessionStorage.getItem("accessToken");
  //if (token && !config.headers.Authorization) {
    //config.headers.Authorization = `Bearer ${token}`;
  //}
  return config;
});

// 4) 응답 인터셉터: 에러 로깅
http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[HTTP ERROR]", err?.response || err);
    return Promise.reject(err);
  }
);

export default http;
