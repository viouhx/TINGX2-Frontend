// src/lib/ws.js
// npm i @stomp/stompjs sockjs-client
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// ---- 환경 변수 (필요 시 .env.* 에서 덮어쓰기) ----
const RAW_WS_URL =
  process.env.REACT_APP_WS_URL ||
  `${window.location.origin.replace(/:\d+$/, ":8080")}/ws/chat`;

// 토픽 프리픽스와 발행 경로도 오버라이드 가능하게
const TOPIC_PREFIX = process.env.REACT_APP_WS_TOPIC_PREFIX || "/topic/chat";
const APP_DEST     = process.env.REACT_APP_WS_APP_DEST     || "/app/send";

// /ws 로 끝나면 /chat 자동 덧붙임
function resolveWSUrl(raw) {
  let u = String(raw || "").trim();
  if (!u) return `${window.location.origin.replace(/:\d+$/, ":8080")}/ws/chat`;
  if (u.endsWith("/ws")) u += "/chat";
  return u;
}

export const WS_URL = resolveWSUrl(RAW_WS_URL);

export function createStompClient({ url = WS_URL, onConnect, onError }) {
  const client = new Client({
    webSocketFactory: () => new SockJS(url),
    reconnectDelay: 2000,
    onConnect,
    onStompError: (frame) => {
      console.error("[STOMP ERROR]", frame?.headers, frame?.body);
      onError?.(frame);
    },
    debug: (msg) => console.log("[STOMP]", msg), // ← 일시적으로 켜서 서버에서 확인
  });
  client.onWebSocketError = (e) => console.error("[WS SOCKET ERROR]", e);
  client.activate();
  // console.log("[WS connect] →", url);
  return client;
}

export function subscribeToSession(client, sessionId, onBody) {
  const topic = `${TOPIC_PREFIX}/${sessionId}`;
  return client.subscribe(topic, (frame) => {
    const data = normalizeWSIn(frame);
    onBody?.(data);
  });
}

export function sendMessage(client, payloadJsonString) {
  client.publish({ destination: APP_DEST, body: payloadJsonString });
}

// ===== WebSocket payload normalizers =====
export function normalizeWSIn(body) {
  let data = body;
  if (typeof body === "string") {
    try { data = JSON.parse(body); } catch { data = { text: body }; }
  } else if (body?.body) {
    try { data = JSON.parse(body.body); } catch { data = { text: String(body.body || "") }; }
  }

  const text =
    data.aiMessage ??
    data.text ??
    data.message ??
    data.reply ??
    data.content ??
    "";

  return { text, raw: data };
}

export function normalizeWSSend({ sessionId, text }) {
  // 기본: { sessionId, message }, 필요 시 서버에서 텍스트 키를 'text'로 바꿔도 됨
  return JSON.stringify({ sessionId, message: text });
}
