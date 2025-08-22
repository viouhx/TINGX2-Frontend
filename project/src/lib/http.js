// src/lib/http.js
import axios from "axios";

const http = axios.create({
  baseURL: "", // ★ 항상 상대경로. 절대 금지
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ★ 절대 URL을 강제로 상대경로로 변환하는 방어막
http.interceptors.request.use((config) => {
  // baseURL에 절대주소가 들어오면 제거
  if (/^https?:\/\//i.test(config.baseURL || "")) {
    config.baseURL = "";
  }
  // url이 절대주소면 path(+query/hash)만 남기기
  if (/^https?:\/\//i.test(config.url || "")) {
    try {
      const u = new URL(config.url);
      config.url = u.pathname + u.search + u.hash;
    } catch {
      // URL 파싱 실패 시 그대로 둡니다.
    }
  }

  // (선택) 최종 확인 로그 — 문제 추적용. 되도록 잠깐만 사용.
  // console.log("[REQ]", { baseURL: config.baseURL, url: config.url });

  // 토큰 헤더(있을 때만)
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
    return Promise.reject(err);
  }
);

export default http;
