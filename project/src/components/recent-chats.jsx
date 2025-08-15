// src/components/recent-chats.js
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getChatSessions } from "../api/chat";

const TOPBAR_H = 52;

/** 날짜를 YYYY. M. D. 포맷으로 */
function toYmdDot(d) {
  try {
    const dt = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    return `${dt.getFullYear()}. ${dt.getMonth() + 1}. ${dt.getDate()}.`;
  } catch {
    return "";
  }
}

/**
 * 서버 응답을 화면에서 쓰기 쉽게 표준화(기본 문구/추정값 없음)
 */
function normalizeSession(s = {}) {
  const id =
    s.sessionId ?? s.id ?? s.session_id ?? s.sessionID ?? null;

  const name =
    s.name ??
    s.partnerName ??
    s.opponentName ??
    s.targetName ??
    s.aiName ??
    "상대방";

  const gender =
    s.gender ?? s.partnerGender ?? s.aiGender ?? "-";

  const age = Number(
    s.age ?? s.partnerAge ?? s.aiAge ?? ""
  ) || null;

  const job =
    s.job ?? s.partnerJob ?? s.aiJob ?? "";

  const msgCount =
    s.messageCount ?? s.msgCount ?? s.totalMessages ?? 0;

  // 점수: 서버가 안 주면 null로 둠(표시 X)
  const liked =
    s.favorability ??
    s.likeability ??
    s.likeabilityScore ??
    s.favorabilityScore ??
    null;

  const total =
    s.totalScore ?? s.overallScore ?? null;

  // 요약/태그: 서버가 안 주면 표시하지 않음
  const summaryRaw =
    s.summary ?? s.oneLiner ?? s.oneLineSummary ?? null;
  const tagRaw =
    s.tag ?? s.partnerTrait ?? null;

  const summary =
    typeof summaryRaw === "string" && summaryRaw.trim() ? summaryRaw.trim() : null;
  const tag =
    typeof tagRaw === "string" && tagRaw.trim() ? tagRaw.trim() : null;

  const createdAt =
    s.createdAt ?? s.created_at ?? s.startedAt ?? null;

  return {
    id,
    name: `${name}님과의 대화`,
    gender: gender === "male" ? "남자" : gender === "female" ? "여자" : String(gender || "-"),
    age,
    job,
    msgCount,
    liked,        // null 가능
    total,        // null 가능
    summary,      // null 가능
    tag,          // null 가능
    date: createdAt ? toYmdDot(createdAt) : "",
    _raw: s,
  };
}

export default function RecentChats() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await getChatSessions(); // 배열 또는 { sessions: [...] }
        const arr = Array.isArray(data) ? data : data?.sessions || [];
        const norm = arr.map(normalizeSession);
        if (!alive) return;
        setList(norm);
      } catch (e) {
        console.error("[recent-chats] load fail:", e);
        if (!alive) return;
        setList([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <Bg>
      <Wrap>
        <TopBar>
          <Back onClick={() => navigate(-1)}>← 마이페이지로</Back>
          <Title>대화 기록</Title>
        </TopBar>

        {loading ? (
          <Empty>불러오는 중...</Empty>
        ) : list.length === 0 ? (
          <Empty>아직 대화 기록이 없어요.</Empty>
        ) : (
          <List>
            {list.map((r) => (
              <Item key={r.id || Math.random()}>
                <ItemHead>
                  <Left>
                    <Icon>💬</Icon>
                    <ItemTitle>{r.name}</ItemTitle>
                  </Left>
                  <Right>
                    <SmallLight>{r.date ? `📅 ${r.date}` : ""}</SmallLight>
                    <SmallBtn
                      onClick={() =>
                        navigate("/analysis", { state: { sessionId: r.id, name: r.name.replace("님과의 대화", "") } })
                      }
                      disabled={!r.id}
                      title={r.id ? "" : "세션 ID 없음"}
                    >
                      📊 분석 보기
                    </SmallBtn>
                  </Right>
                </ItemHead>

                <Line />

                <MetaRow>
                  <Meta>성별 <b>{r.gender}</b></Meta>
                  <Meta>나이 <b>{r.age ? `${r.age}세` : "-"}</b></Meta>
                  <Meta>직업 <b>{r.job || "-"}</b></Meta>
                  <Meta>메시지 <b>{r.msgCount}개</b></Meta>
                </MetaRow>

                <TagRow>
                  {r.liked != null && <Tag pink>호감도 {r.liked}점</Tag>}
                  {r.total != null && <Tag purple>총점 {r.total}점</Tag>}
                  {r.summary && <Summary>{r.summary}</Summary>}
                  {r.tag && <Chip>{r.tag}</Chip>}
                </TagRow>
              </Item>
            ))}
          </List>
        )}
      </Wrap>
    </Bg>
  );
}

/* styles */
const Bg = styled.main`
  min-height: 100vh;
  padding-top: ${TOPBAR_H + 24}px;
  padding-bottom: 40px;
  background: linear-gradient(135deg, #ffb7d5 0%, #ff9ec2 40%, #ffb5d1 100%);
`;
const Wrap = styled.div`
  width: min(1100px, 94vw);
  margin: 0 auto;
`;
const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
`;

const Back = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  font-weight: 800;
  color: #444;
`;

const Title = styled.h2`
  margin: 0;
`;

const Empty = styled.div`
  background:#fff;
  border-radius:16px;
  padding:28px;
  text-align:center;
  box-shadow:0 18px 64px rgba(0,0,0,.16);
`;

const List = styled.div`
  display: grid;
  gap: 16px;
`;

const Item = styled.section`
  background: #fff;
  border-radius: 16px;
  padding: 14px 14px 12px;
  box-shadow: 0 18px 64px rgba(0,0,0,.16);
`;
const ItemHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Icon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #ffeaf2;
`;

const ItemTitle = styled.div`
  font-weight: 900;
`;

const SmallLight = styled.div`
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #f6f6f6;
  display: grid;
  place-items: center;
  font-size: 12px;
  color: #666;
`;

const SmallBtn = styled.button`
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e9e9e9;
  background: #fff;
  cursor: pointer;
  font-weight: 700;
  &:hover{ background: #f9fafb; }
`;
const Line = styled.div`
  height: 1px;
  background: #f1f1f1;
  margin: 10px 0;
`;

const MetaRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  @media (max-width: 760px){ grid-template-columns: repeat(2, 1fr); }
`;

const Meta = styled.div`
  background: #fafafa;
  border: 1px solid #f1f1f1;
  border-radius: 10px;
  padding: 10px;
  color: #666;
  b{ color: #111; margin-left: 6px; }
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Tag = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  ${({ pink }) =>
    pink
      ? `background: #ffe6f0; color: #ff2f79;`
      : `background: #efe9ff; color: #6b5bff;`}
`;
const Summary = styled.span`
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 12px;
  background: #f7f7f7;
  color: #555;
`;

const Chip = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: #eefbf0;
  color: #22a559;
  font-weight: 700;
`;
