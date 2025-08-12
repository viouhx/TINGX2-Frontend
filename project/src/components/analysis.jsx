// src/components/analysis.jsx
import React, { useMemo } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Backend 연동 포인트
 * - 채팅 종료 후 /analysis로 이동할 때, location.state 등에 결과를 담아 넘기면 이 컴포넌트에서 사용합니다.
 * - 지금은 더미 데이터를 기본값으로 사용하고, state가 있으면 그 값을 우선 적용합니다.
 */
export default function Analysis() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};

  // 상대방 이름/점수/문장 등은 백엔드에서 내려준다고 가정
  const name = state?.name || "지영";
  const likeScore = state?.likeScore ?? 98; // 100점 만점
  const quote =
    state?.quote || "대화가 자연스럽고 유머가 있어서 즐거웠어요!";

  // 분석 포인트
  const flow = state?.flow || [
    "자연스러운 인사와 자기소개로 시작",
    "공통 관심사를 찾아 대화가 활발해짐",
    "개인적인 이야기까지 나누며 친밀감 형성",
  ];
  const partnerTraits = state?.partnerTraits || [
    "따뜻하고 친근한 성격",
    "진지한 이야기에도 잘 들어주는 면",
    "유머 감각이 뛰어나고 재미있음",
  ];
  const myStyle = state?.myStyle || [
    "질문을 적절히 섞어가며 대화 진행",
    "상대방의 말에 공감을 잘 표현",
    "진솔한 모습을 보여주려 노력함",
  ];

  const strengths = state?.strengths || [
    "상대방에 대한 관심과 배려가 느껴짐",
    "대화의 균형을 잘 맞춤",
    "긍정적이고 밝은 에너지",
  ];
  const improvements = state?.improvements || [
    "조금 더 자신감 있게 이야기해도 좋을 듯",
    "개인적인 경험담을 더 많이 공유해보세요",
    "상대방의 답변에 더 깊이 있는 질문을 해보세요",
  ];

  // 카테고리 점수(각 20점 만점)
  const cats = state?.categories || {
    manners: 19,
    sense: 16,
    talk: 17,
    care: 20,
    humor: 17,
  };

  const overall = state?.overall ?? 85; // 종합 점수 100점 만점

  // 레이더 차트용 배열 (각각 0~20)
  const radar = useMemo(
    () => [
      { key: "매너", v: cats.manners ?? 0 },
      { key: "센스", v: cats.sense ?? 0 },
      { key: "대화", v: cats.talk ?? 0 },
      { key: "배려", v: cats.care ?? 0 },
      { key: "유머", v: cats.humor ?? 0 },
    ],
    [cats]
  );

  const handleSave = () => {
    // TODO: 저장 API 연동 (예: POST /api/analysis)
    alert("저장되었습니다! (샘플) 마이페이지 연동은 이후에 진행해요.");
  };

  return (
    <Bg>
      <Wrap>
        <Hero>
          <HeroIcon>♡</HeroIcon>
          <HeroTitle>{name}님과의 대화를 분석했어요</HeroTitle>
          <SaveBtn onClick={handleSave}>저장</SaveBtn>
        </Hero>

        {/* 상단 두 카드: 호감도 / 한마디 */}
        <Row cols={2}>
          <Card>
            <CardHead>
              <CardIcon>♡</CardIcon>
              <CardTitle>{name}님의 호감도 지수</CardTitle>
            </CardHead>
            <ScoreBig>
              {likeScore}
              <small>점</small>
            </ScoreBig>
            <SubHint>100점 만점</SubHint>
          </Card>

          <Card>
            <CardHead>
              <CardIcon>💬</CardIcon>
              <CardTitle>{name}님의 한마디</CardTitle>
            </CardHead>
            <Quote>“{quote}”</Quote>
          </Card>
        </Row>

        {/* 분석 섹션: 흐름 / 상대 성향 / 나의 스타일 */}
        <Row cols={3}>
          <Card>
            <CardHead>
              <CardIcon>🌱</CardIcon>
              <CardTitle>대화 흐름</CardTitle>
            </CardHead>
            <List>
              {flow.map((t, i) => (
                <li key={i}>
                  <Num>{i + 1}</Num>
                  {t}
                </li>
              ))}
            </List>
          </Card>

          <Card>
            <CardHead>
              <CardIcon>🔎</CardIcon>
              <CardTitle>상대 성향 파악</CardTitle>
            </CardHead>
            <List>
              {partnerTraits.map((t, i) => (
                <li key={i}>
                  <Num>{i + 1}</Num>
                  {t}
                </li>
              ))}
            </List>
          </Card>

          <Card>
            <CardHead>
              <CardIcon>🧭</CardIcon>
              <CardTitle>나의 대화 스타일</CardTitle>
            </CardHead>
            <List>
              {myStyle.map((t, i) => (
                <li key={i}>
                  <Num>{i + 1}</Num>
                  {t}
                </li>
              ))}
            </List>
          </Card>
        </Row>

        {/* 피드백: 장점 / 보완점 */}
        <Row cols={2}>
          <Card>
            <CardHead>
              <CardIcon>✅</CardIcon>
              <CardTitle>장점</CardTitle>
            </CardHead>
            <List>
              {strengths.map((t, i) => (
                <li key={i}>
                  <Bullet good>●</Bullet>
                  {t}
                </li>
              ))}
            </List>
          </Card>

          <Card>
            <CardHead>
              <CardIcon>🛠</CardIcon>
              <CardTitle>보완할 점</CardTitle>
            </CardHead>
            <List>
              {improvements.map((t, i) => (
                <li key={i}>
                  <Bullet>●</Bullet>
                  {t}
                </li>
              ))}
            </List>
          </Card>
        </Row>

        {/* 종합 점수 카드 */}
        <BigCard>
          <BigTitle>소개팅 종합 점수</BigTitle>
          <Overall>
            {overall}
            <small>점</small>
          </Overall>
          <SubHint>100점 만점</SubHint>

          <Divider />

          <SmallTitle>항목별 점수 (각 20점 만점)</SmallTitle>
          <Pills>
            <Pill>
              <span>🥰 매너</span>
              <b>{cats.manners}/20</b>
            </Pill>
            <Pill>
              <span>✨ 센스</span>
              <b>{cats.sense}/20</b>
            </Pill>
            <Pill>
              <span>💬 대화</span>
              <b>{cats.talk}/20</b>
            </Pill>
            <Pill>
              <span>❤️ 배려</span>
              <b>{cats.care}/20</b>
            </Pill>
            <Pill>
              <span>😁 유머</span>
              <b>{cats.humor}/20</b>
            </Pill>
          </Pills>
        </BigCard>

        {/* 레이더 차트 */}
        <Card>
          <CardHead>
            <CardIcon>📈</CardIcon>
            <CardTitle>종합 분석 차트</CardTitle>
          </CardHead>
          <ChartWrap>
            <RadarChart data={radar} max={20} size={360} />
          </ChartWrap>
        </Card>

        <BottomBar>
          <RestartBtn onClick={() => navigate("/main")}>⟲ 다시 시작하기</RestartBtn>
        </BottomBar>
      </Wrap>
    </Bg>
  );
}

/* ---------- SVG Radar Chart (no deps) ---------- */
function RadarChart({ data, max = 20, size = 320 }) {
  const R = size / 2 - 16;
  const cx = size / 2;
  const cy = size / 2;
  const n = data.length;

  const points = data.map((d, i) => {
    const angle = (-Math.PI / 2) + (2 * Math.PI * i) / n;
    const r = (d.v / max) * R;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });

  const grid = [0.25, 0.5, 0.75, 1].map((ratio, idx) => {
    const pts = data.map((_, i) => {
      const angle = (-Math.PI / 2) + (2 * Math.PI * i) / n;
      const r = ratio * R;
      return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    });
    return (
      <polygon
        key={idx}
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="rgba(0,0,0,.08)"
      />
    );
  });

  const axis = data.map((d, i) => {
    const angle = (-Math.PI / 2) + (2 * Math.PI * i) / n;
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);
    const lx = cx + (R + 18) * Math.cos(angle);
    const ly = cy + (R + 18) * Math.sin(angle);
    return (
      <g key={d.key}>
        <line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(0,0,0,.08)" />
        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#666">
          {d.key}
        </text>
      </g>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={R} fill="#f8f9fb" stroke="rgba(0,0,0,.06)" />
      {grid}
      {axis}
      <polygon
        points={points.map((p) => p.join(",")).join(" ")}
        fill="rgba(124,58,237,.18)"  // 보라 계열 반투명
        stroke="rgba(124,58,237,1)"
        strokeWidth="2"
      />
      {points.map(([x, y], idx) => (
        <circle key={idx} cx={x} cy={y} r="3.5" fill="rgba(124,58,237,1)" />
      ))}
    </svg>
  );
}

/* ---------- styles ---------- */
const TOPBAR_H = 52;

const Bg = styled.main`
  min-height: 100vh;
  background: linear-gradient(135deg, #ffb7d5 0%, #ff9ec2 40%, #ffb5d1 100%);
  padding: ${TOPBAR_H + 18}px 16px 32px; /* 상단바만큼 여백 */
  display: grid;
  place-items: start center;
`;

const Wrap = styled.div`
  width: min(1100px, 94vw);
  display: grid;
  gap: 18px;
`;

const Hero = styled.section`
  position: relative;
  background: #fff;
  border-radius: 16px;
  padding: 22px 22px 18px;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
  text-align: center;
`;
const HeroIcon = styled.div`
  width: 52px; height: 52px; border-radius: 50%;
  border: 2px solid #ff2f79; color: #ff2f79;
  display: grid; place-items: center; margin: 0 auto 8px;
  font-weight: 800;
`;
const HeroTitle = styled.h2`
  margin: 6px 0 0; color: #333;
`;
const SaveBtn = styled.button`
  position: absolute; right: 14px; top: 14px;
  height: 32px; padding: 0 12px; border-radius: 8px;
  border: 1.5px solid #e6e6e6; background: #fff; cursor: pointer; font-weight: 700;
  &:hover { background: #fafafa; }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ cols }) => cols || 2}, 1fr);
  gap: 16px;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  background: #fff;
  border-radius: 14px;
  padding: 18px 18px 16px;
  box-shadow: 0 12px 36px rgba(0,0,0,.12);
`;
const BigCard = styled(Card)`
  padding-top: 22px;
`;
const CardHead = styled.div`
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
`;
const CardIcon = styled.span` font-size: 18px; `;
const CardTitle = styled.h3` font-size: 16px; margin: 0; color: #333; `;

const ScoreBig = styled.div`
  font-size: clamp(36px, 5vw, 44px);
  font-weight: 900; color: #10b981;
  small { font-size: .6em; margin-left: 2px; }
`;
const SubHint = styled.div`
  margin-top: 6px; font-size: 12px; color: #888;
`;
const Quote = styled.blockquote`
  margin: 6px 0 0; color: #333; line-height: 1.6;
`;

const List = styled.ol`
  margin: 0; padding-left: 0; list-style: none; display: grid; gap: 8px;
  li { display: flex; gap: 8px; color: #444; }
`;
const Num = styled.span`
  width: 22px; height: 22px; border-radius: 999px; display: inline-grid; place-items: center;
  background: #eef2ff; color: #4f46e5; font-size: 12px; font-weight: 800;
`;
const Bullet = styled.span`
  color: ${({ good }) => (good ? "#10b981" : "#ef4444")};
  transform: translateY(1px);
`;

const BigTitle = styled.h3`
  margin: 0 0 4px; color: #333; text-align: center;
`;
const Overall = styled.div`
  text-align: center;
  font-size: clamp(38px, 5.5vw, 46px);
  font-weight: 900; color: #059669;
  small { font-size: .6em; margin-left: 2px; }
`;
const Divider = styled.div`
  height: 1px; background: #f0f0f0; margin: 14px 0 10px;
`;
const SmallTitle = styled.div`
  font-weight: 800; color: #333; margin-bottom: 10px;
`;
const Pills = styled.div`
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;
  @media (max-width: 960px) { grid-template-columns: repeat(2, 1fr); }
`;
const Pill = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  border: 1.5px solid #eef0f2; border-radius: 10px; padding: 10px 12px;
  background: #fff;
  span { color: #555; }
  b { color: #059669; }
`;

const ChartWrap = styled.div`
  display: grid; place-items: center; padding: 8px 0 2px;
`;

const BottomBar = styled.div`
  display: grid; place-items: center; margin-top: 6px;
`;
const RestartBtn = styled.button`
  height: 38px; padding: 0 16px; border-radius: 10px; border: 0; color: #fff; font-weight: 800;
  background: linear-gradient(180deg,#ff3f8a 0%, #ff2f79 100%);
  box-shadow: 0 10px 22px rgba(255,47,121,.35);
  cursor: pointer;
`;
