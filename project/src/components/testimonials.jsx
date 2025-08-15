// src/components/testimonials.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createStompClient,
  subscribeToSession,
  sendMessage,
  normalizeWSIn,
  normalizeWSSend,
} from "../lib/ws";
/**
 * props:
 * - messages: [{ id, role: 'ai'|'user', text, ts }]
 * - setMessages: fn
 * - isLoggedIn: bool (디자인엔 영향 X)
 */
export function Testimonials({ messages: extMsgs, setMessages: setExtMsgs, isLoggedIn }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const sessionId = state?.sessionId ?? null;       // 메인에서 넘겨준 세션
  const initialHello = state?.aiHello || null;      // 메인에서 넘겨준 첫 인사
  const opponent = state?.opponent || {
    name: state?.name || "상대방",
    age: state?.age ?? null,
    job: state?.job || "",
    gender: state?.gender || "",
    talkStyles: state?.talkStyles || [],
    traits: state?.traits || [],
    hobbies: state?.hobbies || [],
  };
  const clientRef = useRef(null);                 // STOMP Client
  const subRef = useRef(null);                    // 구독 핸들
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false); // AI 로딩 버블
  const [sentCount, setSentCount] = useState(0);
  const bottomRef = useRef(null);

  // 외부 상태가 없으면 내부 상태로 폴백
  const [intMsgs, setIntMsgs] = useState([]);
  const msgs = useMemo(() => (extMsgs ?? intMsgs), [extMsgs, intMsgs]);
  const setMsgs = useMemo(() => (setExtMsgs ?? setIntMsgs), [setExtMsgs]);
  const handleKeyDown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();   // 줄바꿈 막기
    handleSend();         // 전송
  }
};

// 한글 종성 체크 → "이에요/예요" 등
  const hasJong = (word = "") => {
    if (!word) return false;
    const ch = word[word.length - 1];
    const code = ch.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return false;
    return ((code - 0xac00) % 28) !== 0;
  };

  // 최초 AI 인사 메시지
  useEffect(() => {
    if (!msgs || msgs.length === 0) {
      setMsgs([
        {
          id: Date.now(),
          role: "ai",
          text:
            initialHello ||
            `안녕하세요! ${opponent.name}${hasJong(opponent.name) ? "이에요" : "예요"}. 어떤 이야기부터 시작할까요?`,
          ts: new Date(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 세션 발화 제한(10) 현재 카운트 로드
  const PER_SESSION_LIMIT = 10;
  const sessionCountKey = sessionId ? `tt_session_${sessionId}_sent` : null;
  useEffect(() => {
    const isLocal = String(sessionId || "").startsWith("local-");
 if (!sessionId || isLocal) return; // 로컬 세션은 WS 연결 생략
    const n = Number(localStorage.getItem(sessionCountKey) || "0");
    setSentCount(Number.isFinite(n) ? n : 0);
  }, [sessionId]); 

  // 새 메시지 오면 맨 아래로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, typing]);

  // ✅ 세션이 있을 때만 WS 연결 → /topic/{sessionId} 구독
useEffect(() => {
  if (!sessionId) return; // 세션 없으면 오프라인 모드(더미 응답)
  if (String(sessionId).startsWith("local-")) return; // 로컬 세션은 WS 생략
  const client = createStompClient({
    onConnect: () => {
      // 구독 시작
      subRef.current = subscribeToSession(client, sessionId, (body) => {
        // 백엔드 응답 키 매핑 (상황별로 자동 스위칭)
        const { text: aiText } = normalizeWSIn(body);
        if (aiText) {
          setMsgs((prev) => [
            ...prev,
            { id: Date.now(), role: "ai", text: aiText, ts: new Date() },
          ]);
          setTyping(false);
        }
      });
    },
    onError: (err) => {
      console.error("[WS] error:", err);
    },
  });

  clientRef.current = client;

  return () => {
    try { subRef.current?.unsubscribe(); } catch {}
    try { client.deactivate(); } catch {}
    subRef.current = null;
    clientRef.current = null;
  };
}, [sessionId, setMsgs]);

  const handleSend = (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text) return;

    // 세션당 사용자 발화 10회 제한
    if (sessionId && sentCount >= PER_SESSION_LIMIT) {
      alert("이 세션에서 보낼 수 있는 횟수(10회)를 모두 사용했습니다.");
      return;
    }

    // 내 메시지 즉시 렌더
    setMsgs((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text, ts: new Date() },
    ]);
    setInput("");

    if (sessionId) {
      // 카운트 +1 저장
      const next = sentCount + 1;
      setSentCount(next);
      localStorage.setItem(sessionCountKey, String(next));
    }

    // WS 연결 시 서버로 전송 → /app/send
    if (clientRef.current?.connected && sessionId) {
      setTyping(true); // 서버 응답 대기 UI
      sendMessage(clientRef.current, normalizeWSSend({ sessionId, text }));
    } else {
      // 오프라인(WS 미연결) 더미 응답 유지
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMsgs((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "ai",
            text: "(WS 미연결) 더미 응답입니다. 서버 연결 후 실시간 메시지가 표시됩니다.",
            ts: new Date(),
          },
        ]);
      }, 1000);
    }
  };

  const outOfQuota = !!sessionId && sentCount >= PER_SESSION_LIMIT;
  const avatarEmoji = opponent.gender === "male" ? "👨" : opponent.gender === "female" ? "👩" : "👤";

  return (
    <Wrap>
      <ChatHeader>
        <Left>
          <BackBtn type="button" onClick={() => navigate(-1)} aria-label="뒤로가기">
            ←
          </BackBtn>
          <Avatar $sm aria-hidden>{avatarEmoji}</Avatar>
          <HeaderInfo>
            <Name>{opponent.name}</Name>
            <Sub>
              {opponent.age ? `${opponent.age}세` : ""}
              {opponent.age && opponent.job ? " · " : ""}
              {opponent.job || ""}
            </Sub>
          </HeaderInfo>
        </Left>

        <Right>
          {sessionId && (
            <Quota title="이 세션에서 보낼 수 있는 남은 횟수">
              {PER_SESSION_LIMIT - sentCount} / {PER_SESSION_LIMIT}
            </Quota>
          )}
          <AnalyzeBtn
            type="button"            
            onClick={() => navigate("/analysis", { state: { sessionId, name: opponent.name } })}
            disabled={!sessionId}
            title={sessionId ? "" : "세션 정보가 없어요"}
          >
            📊 분석 보기
          </AnalyzeBtn>
        </Right>
      </ChatHeader>

      <MessagesArea>
        {msgs.map((m) =>
          m.role === "ai" ? (
            <Row key={m.id}>
              <Avatar $sm aria-hidden>{avatarEmoji}</Avatar>
              <BubbleAI>
                {m.text}
                <Time>{formatTime(m.ts)}</Time>
              </BubbleAI>
            </Row>
          ) : (
            <RowMine key={m.id}>
              <BubbleMe>
                {m.text}
                <Time $me>{formatTime(m.ts)}</Time>
              </BubbleMe>
            </RowMine>
          )
        )}

        {/* AI 타이핑 로딩 */}
        {typing && (
          <Row>            
            <Avatar aria-hidden>{avatarEmoji}</Avatar>
            <TypingBubble>
              <Dot />
              <Dot />
              <Dot />
            </TypingBubble>
          </Row>
        )}

        <div ref={bottomRef} />
      </MessagesArea>

      <InputBar onSubmit={handleSend}>
      
        <MsgInput
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={outOfQuota}
          title={outOfQuota ? "이 세션의 발화 제한(10회)을 모두 사용했습니다." : ""}
        />
        <SendBtn type="submit" aria-label="전송" disabled={outOfQuota} title={outOfQuota ? "제한 초과" : ""}>
          ✈
        </SendBtn>
      </InputBar>
    </Wrap>
  );
}

/* ===== helpers ===== */
function formatTime(ts) {
  try {
    const d = ts instanceof Date ? ts : new Date(ts);
    const hh = d.getHours();
    const mm = `${d.getMinutes()}`.padStart(2, "0");
    return `${hh < 12 ? "오전" : "오후"} ${hh % 12 || 12}:${mm}`;
  } catch {
    return "";
  }
}

/* ===== layout constants ===== */
const TOPBAR_H = 52;        // 고정 상단바 높이
const EXTRA_GAP = 0;        // 필요 시 살짝 띄우고 싶을 때
const CHAT_HEADER_H = 60;   // 채팅 상단(상대 정보) 높이
const INPUT_BAR_H   = 64;   // 입력바 높이
const CONTENT_MAX_W = 1100;

/* ===== styles (grid) ===== */
const Wrap = styled.section`
  height: calc(100vh - ${TOPBAR_H}px);
  padding-top: ${TOPBAR_H + EXTRA_GAP}px;    /* 탑바 아래로 전체 컨텐츠 내림 */
  display: grid;
  grid-template-rows: ${CHAT_HEADER_H}px 1fr ${INPUT_BAR_H}px;  /* 헤더 / 메시지 / 입력바 */
  background: #fff;
`;

const ChatHeader = styled.header`
  grid-row: 1;
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  padding: 0 16px;
  background: linear-gradient(180deg, rgba(255,183,213,.35), rgba(255,183,213,.15), #fff 80%);
  border-bottom: 1px solid rgba(0,0,0,.04);

  /* ✅ 가운데 정렬 + 최대폭 제한 */
  width: min(${CONTENT_MAX_W}px, 96vw);
  margin: 0 auto;
`;

const Left = styled.div`
  display: flex; 
  align-items: 
  center; gap: 10px;
`;

const Right = styled.div``;

const Quota = styled.span`
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 8px;
  margin-right: 8px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,.08);
  background: #fff;
  font-size: 12px;
  color: #111;
`;

const BackBtn = styled.button`
  border: 0; 
  background: transparent; 
  font-size: 18px;
  width: 32px; 
  height: 32px; 
  border-radius: 8px; 
  cursor: pointer;
  &:hover { background: rgba(0,0,0,.06); }
`;

const Avatar = styled.div`
  width: ${({ $sm }) => ($sm ? 28 : 32)}px;
  height: ${({ $sm }) => ($sm ? 28 : 32)}px;
  border-radius: 999px;
  background: #f3f4f6;
  display: grid; place-items: center;
  font-size: ${({ $sm }) => ($sm ? 14 : 16)}px;
`;

const HeaderInfo = styled.div`
  display: flex; 
  flex-direction: column; 
  line-height: 1.1;
`;

const Name = styled.div` 
font-weight: 800; 
color: #111; 
`;

const Sub = styled.div` 
font-size: 12px; 
color: #888; 
`;

const MessagesArea = styled.div`
  grid-row: 2;
  overflow-y: auto;
  padding: 16px 16px 24px;

  /* ✅ 가운데 정렬 + 최대폭 제한 */
  width: min(${CONTENT_MAX_W}px, 96vw);
  margin: 0 auto;
`;

const Row = styled.div`
  display: flex; 
  align-items: flex-end; 
  gap: 8px; 
  margin: 8px 0;
`;

const RowMine = styled(Row)`
  justify-content: flex-end;
`;

const BubbleAI = styled.div`
  max-width: min(70%, 640px);
  background: #f3f4f6;
  color: #111;
  padding: 10px 12px;
  border-radius: 12px 12px 12px 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,.06);
  font-size: 14px;
  line-height: 1.5;
  position: relative;
`;

const BubbleMe = styled(BubbleAI)`
  background: #0f172a;  /* 딥 네이비 */
  color: #fff;
  border-radius: 12px 12px 6px 12px;
`;

const Time = styled.div`
  margin-top: 6px;
  font-size: 11px;
  color: ${({ $me }) => ($me ? "rgba(255,255,255,.7)" : "#90939a")};
`;

const bounce = keyframes`
  0% { transform: translateY(0); opacity: .5; }
  20% { transform: translateY(-3px); opacity: 1; }
  40% { transform: translateY(0); opacity: .7; }
`;

const TypingBubble = styled(BubbleAI)`
  display: inline-flex; 
  gap: 6px; 
  align-items: center;
  width: 64px; 
  justify-content: center;
`;

const Dot = styled.span`
  width: 6px; 
  height: 6px; 
  border-radius: 50%;
  background: #9ca3af;
  animation: ${bounce} 1s infinite;
  &:nth-child(2){ animation-delay: .15s; }
  &:nth-child(3){ animation-delay: .3s; }
`;

const InputBar = styled.form`
  grid-row: 3;
  display: grid; 
  grid-template-columns: 1fr 44px; 
  gap: 8px;
  padding: 10px 16px;
  background: #fff;
  border-top: 1px solid rgba(0,0,0,.06);

  /* ✅ 가운데 정렬 + 최대폭 제한 */
  width: min(${CONTENT_MAX_W}px, 96vw);
  margin: 0 auto;
`;

const MsgInput = styled.textarea`
  resize: none;
  height: 44px;
  padding: 12px 12px;
  border-radius: 10px;
  border: 1.5px solid #ececec;
  background: #f8fafc;
  outline: none;
  font-size: 14px;
  line-height: 18px;
  overflow-y: auto;
  &:focus { border-color: #cbd5e1; background: #fff; }
`;

const SendBtn = styled.button`
  border: 0; 
  border-radius: 10px;
  background: #9aa0a6;
  color: #fff; 
  font-size: 16px; 
  cursor: pointer;
  &:hover { filter: brightness(0.97); }
  &:active { transform: translateY(1px); }
`;

const AnalyzeBtn = styled.button`
  display: inline-flex; 
  align-items: center; 
  gap: 6px;
  border: 1px solid rgba(0,0,0,.12);
  background: #fff;
  height: 35px; 
  padding: 0 10px;
  border-radius: 8px; 
  cursor: pointer; 
  font-size: 13px; 
  font-weight: 700;
  &:hover { background: #f9fafb; }
`;
