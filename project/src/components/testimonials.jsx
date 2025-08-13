// src/components/testimonials.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

/**
 * props:
 * - messages: [{ id, role: 'ai'|'user', text, ts }]
 * - setMessages: fn
 * - isLoggedIn: bool (디자인엔 영향 X)
 */
export function Testimonials({ messages: extMsgs, setMessages: setExtMsgs, isLoggedIn }) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false); // AI 로딩 버블
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

  // 최초 AI 인사 메시지
  useEffect(() => {
    if (!msgs || msgs.length === 0) {
      setMsgs([
        {
          id: Date.now(),
          role: "ai",
          text: "안녕하세요! 지연이에요. 어떤 이야기부터 시작할까요?",
          ts: new Date(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 새 메시지 오면 맨 아래로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, typing]);

  const handleSend = (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text) return;

    // 사용자 메시지 추가
    setMsgs((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text, ts: new Date() },
    ]);
    setInput("");

    // AI 타이핑 표시 → 간단한 더미 응답
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "ai",
          text: "네, 반가워요! 저도 처음 뵙네요. 어떤 일을 하시나요?",
          ts: new Date(),
        },
      ]);
    }, 1200);
  };

  return (
    <Wrap>
      <ChatHeader>
        <Left>
          <BackBtn type="button" onClick={() => navigate(-1)} aria-label="뒤로가기">
            ←
          </BackBtn>
          <Avatar sm aria-hidden>👤</Avatar>
          <HeaderInfo>
            <Name>지연</Name>
            <Sub>25세 · 디자이너</Sub>
          </HeaderInfo>
        </Left>

        <Right>
          <AnalyzeBtn type="button" onClick={() => navigate("/analysis")}>
            📊 분석 보기
          </AnalyzeBtn>
        </Right>
      </ChatHeader>

      <MessagesArea>
        {msgs.map((m) =>
          m.role === "ai" ? (
            <Row key={m.id}>
              <Avatar aria-hidden>👤</Avatar>
              <BubbleAI>
                {m.text}
                <Time>{formatTime(m.ts)}</Time>
              </BubbleAI>
            </Row>
          ) : (
            <RowMine key={m.id}>
              <BubbleMe>
                {m.text}
                <Time me>{formatTime(m.ts)}</Time>
              </BubbleMe>
            </RowMine>
          )
        )}

        {/* AI 타이핑 로딩 */}
        {typing && (
          <Row>
            <Avatar aria-hidden>👤</Avatar>
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
        />
        <SendBtn type="submit" aria-label="전송">✈</SendBtn>
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
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
  background: linear-gradient(180deg, rgba(255,183,213,.35), rgba(255,183,213,.15), #fff 80%);
  border-bottom: 1px solid rgba(0,0,0,.04);

  /* ✅ 가운데 정렬 + 최대폭 제한 */
  width: min(${CONTENT_MAX_W}px, 96vw);
  margin: 0 auto;
`;

const Left = styled.div`
  display: flex; align-items: center; gap: 10px;
`;

const Right = styled.div``;

const BackBtn = styled.button`
  border: 0; background: transparent; font-size: 18px;
  width: 32px; height: 32px; border-radius: 8px; cursor: pointer;
  &:hover { background: rgba(0,0,0,.06); }
`;

const Avatar = styled.div`
  width: ${({ sm }) => (sm ? 28 : 32)}px;
  height: ${({ sm }) => (sm ? 28 : 32)}px;
  border-radius: 999px;
  background: #f3f4f6;
  display: grid; place-items: center;
  font-size: ${({ sm }) => (sm ? 14 : 16)}px;
`;

const HeaderInfo = styled.div`
  display: flex; flex-direction: column; line-height: 1.1;
`;
const Name = styled.div` font-weight: 800; color: #111; `;
const Sub = styled.div` font-size: 12px; color: #888; `;

const MessagesArea = styled.div`
  grid-row: 2;
  overflow-y: auto;
  padding: 16px 16px 24px;

  /* ✅ 가운데 정렬 + 최대폭 제한 */
  width: min(${CONTENT_MAX_W}px, 96vw);
  margin: 0 auto;
`;

const Row = styled.div`
  display: flex; align-items: flex-end; gap: 8px; margin: 8px 0;
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
  color: ${({ me }) => (me ? "rgba(255,255,255,.7)" : "#90939a")};
`;

const bounce = keyframes`
  0% { transform: translateY(0); opacity: .5; }
  20% { transform: translateY(-3px); opacity: 1; }
  40% { transform: translateY(0); opacity: .7; }
`;

const TypingBubble = styled(BubbleAI)`
  display: inline-flex; gap: 6px; align-items: center;
  width: 64px; justify-content: center;
`;

const Dot = styled.span`
  width: 6px; height: 6px; border-radius: 50%;
  background: #9ca3af;
  animation: ${bounce} 1s infinite;
  &:nth-child(2){ animation-delay: .15s; }
  &:nth-child(3){ animation-delay: .3s; }
`;

const InputBar = styled.form`
  grid-row: 3;
  display: grid; grid-template-columns: 1fr 44px; gap: 8px;
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
  border: 0; border-radius: 10px;
  background: #9aa0a6;
  color: #fff; font-size: 16px; cursor: pointer;
  &:hover { filter: brightness(0.97); }
  &:active { transform: translateY(1px); }
`;

const AnalyzeBtn = styled.button`
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid rgba(0,0,0,.12);
  background: #fff;
  height: 35px; padding: 0 10px;
  border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 700;
  &:hover { background: #f9fafb; }
`;
