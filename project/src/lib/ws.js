// src/lib/ws.js
// npm i @stomp/stompjs sockjs-client
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// SockJS 엔드포인트 URL
// .env의 REACT_APP_WS_URL이 있으면 사용, 없으면 8080 포트의 /ws/chat
const WS_URL =
  process.env.REACT_APP_WS_URL ||
  `${window.location.origin.replace(/:\d+$/, ":8080")}/ws/chat`;

  /**
 * STOMP 클라이언트 생성/활성화
 * - SockJS로 연결
 * - 끊기면 2s마다 재시도
 */
export function createStompClient({ url = WS_URL, onConnect, onError }) {
  const client = new Client({
    webSocketFactory: () => new SockJS(url),
    reconnectDelay: 2000,
    onConnect,
    onStompError: (frame) => {
      console.error("[STOMP ERROR]", frame?.headers, frame?.body);
      onError?.(frame);
    },
  });
  client.activate(); // 연결 시작
  return client;
}

export function subscribeToSession(client, sessionId, onBody) {
  return client.subscribe(`/topic/chat/${sessionId}`, (frame) => {
    const data = normalizeWSIn(frame);
    onBody?.(data);
  });
}

export function sendMessage(client, payloadJsonString) {
  client.publish({ destination: "/app/send", body: payloadJsonString });
}

// ===== WebSocket payload normalizers =====

/**
 * 서버에서 오는 데이터를 최대한 유연하게 파싱:
 * - STOMP Frame or string
 * - JSON이면 파싱, 아니면 body string을 그대로
 * - aiMessage/text/message/reply/content 중 하나를 text로 통일
 */
export function normalizeWSIn(body) {
  let data = body;
  if (typeof body === "string") {
    try { data = JSON.parse(body); } catch { data = { text: body }; }
  } else if (body?.body) {
    try { data = JSON.parse(body.body); } catch { data = { text: body.body }; }
  }

  const text =
    data.aiMessage ?? // ★ 서버 응답 키
    data.text ??
    data.message ??
    data.reply ??
    data.content ??
    "";

  return { text, raw: data };
}

/**
 * 클라이언트 → 서버 전송 포맷 표준화
 * - 서버 요구사항: { sessionId, message }
 */

export function normalizeWSSend({ sessionId, text }) {
  // ★ 서버 요구: { sessionId, message }
  return JSON.stringify({ sessionId, message: text });
}

export { WS_URL };
