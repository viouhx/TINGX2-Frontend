
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { requestAnalysis, fetchAnalysis } from "../api/chat";

/* API → UI 필드 표준화:
   - 백엔드 스키마가 바뀌거나 키 이름이 달라도 여기서 한 번에 흡수 */
function normalizeAnalysis(api = {}) {
  const name =
    api.partnerName || api.opponentName || api.targetName || undefined;

  // 숫자 점수 후보들 중 있는 값 채택
  const likeScore =
    api.favorabilityScore ??
    api.likeability ??
    api.likeabilityScore ??
    api.favorScore ??
    null;

  // 한 줄 요약/멘트 후보
  const quote =
    api.prosConsComment ||
    api.oneLiner ||
    api.oneLineSummary ||
    api.summary ||
    "";

  // 배열로 뽑아내는 항목들
  const flow = [
    api.conversationFlow1,
    api.conversationFlow2,
    api.conversationFlow3,
  ].filter(Boolean);

  const partnerTraits = [
    api.partnerTrait1,
    api.partnerTrait2,
    api.partnerTrait3,
  ].filter(Boolean);

  const myStyle = [api.myStyle1, api.myStyle2, api.myStyle3].filter(Boolean);

  const strengths = [api.strength1, api.strength2, api.strength3].filter(Boolean);
  const improvements = [api.improvement1, api.improvement2, api.improvement3].filter(Boolean);

  // 카테고리 점수(각 20점 만점 가정)
  const toNum = (v) => (v == null ? null : Number(v));
  const cats = {
    manners: toNum(api.mannerScore),
    sense: toNum(api.senseScore),
    talk: toNum(api.conversationScore),
    care: toNum(api.considerationScore),
    humor: toNum(api.humorScore),
  };

  const overall = api.totalScore ?? api.overallScore ?? null;

  return { name, likeScore, quote, flow, partnerTraits, myStyle, strengths, improvements, cats, overall };
}

export default function Analysis() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};

  const sessionId =
    state?.sessionId ??
    (() => {
      const q = new URLSearchParams(window.location.search).get("sessionId");
      return q ? Number(q) : null;
    })();

  // 로딩/데이터 상태
  const [loading, setLoading] = useState(!!sessionId);
  const [data, setData] = useState({
    name: state?.name ?? "", // 헤더 타이틀에 사용
    likeScore: null,
    quote: "",
    flow: [],
    partnerTraits: [],
    myStyle: [],
    strengths: [],
    improvements: [],
    cats: { manners: null, sense: null, talk: null, care: null, humor: null },
    overall: null,
  });

  // 마운트 시 분석 요청
  useEffect(() => {
    if (!sessionId) return; // 세션 없으면 빈 화면 UX
    let cancelled = false;
   (async () => {
     try {
       // 1) 오래 걸릴 수 있으니 timeout 늘린 POST
       const res = await requestAnalysis(sessionId);
       // 서버가 { success, message, data: {...} } 형태로 줄 수 있으니 언래핑
       const payload = res?.data?.data ?? res?.data ?? {};
       if (!cancelled && Object.keys(payload || {}).length) {
   const normalized = normalizeAnalysis(payload);
   setData(prev => ({ ...prev, ...normalized }));
   // ✅ 세션별 캐시 (원본 payload를 넣어두면 성별/나이/직업 키도 같이 보존)
   try {
     localStorage.setItem(`analysisCache.${sessionId}`, JSON.stringify(payload));
   } catch {}
   setLoading(false);
   return;
 }
     } catch (e) {
       // axios timeout 등은 'canceled'처럼 보일 수 있음 → 폴백으로 넘어감
       console.warn("[analysis] POST fallback to GET:", e?.message || e);
     }

     // 2) 폴백: 이미 DB에 저장된 결과를 짧게 여러 번 조회
     try {
       for (let i = 0; i < 3 && !cancelled; i++) {
         const { data: got } = await fetchAnalysis(sessionId);
         const payload = got?.data ?? got ?? {};
         if (Object.keys(payload || {}).length) {
           if (!cancelled) {
             setData(prev => ({ ...prev, ...normalizeAnalysis(payload) }));
           }
           // ✅ 폴백으로 받아온 결과도 캐시에 저장해야 마이페이지에서 바로 보임
  try {
    localStorage.setItem(`analysisCache.${sessionId}`, JSON.stringify(payload));
  } catch {}
           break;
         }
         // 잠깐 대기 후 재시도
         await new Promise(r => setTimeout(r, 1500));
       }
     } catch (e) {
       console.error("[analysis] GET fetch failed:", e);
     } finally {
       if (!cancelled) setLoading(false);
     }
   })();
   return () => { cancelled = true; };
  }, [sessionId]);

  const { name, likeScore, quote, flow, partnerTraits, myStyle, strengths, improvements, cats, overall } = data;

  // 레이더 차트에 들어갈 값(없으면 0으로)
  const toSafeNumber = (x) => (x == null || Number.isNaN(Number(x)) ? 0 : Number(x));
  const radar = [
    { key: "매너", v: toSafeNumber(cats.manners) },
    { key: "센스", v: toSafeNumber(cats.sense) },
    { key: "대화", v: toSafeNumber(cats.talk) },
    { key: "배려", v: toSafeNumber(cats.care) },
    { key: "유머", v: toSafeNumber(cats.humor) },
  ];

  
  if (loading) return <LoadingWrap>분석 중…</LoadingWrap>;

  // 빈 데이터면 가이드 화면
  const hasData =
    likeScore != null ||
    !!quote ||
    flow.length > 0 ||
    partnerTraits.length > 0 ||
    myStyle.length > 0 ||
    strengths.length > 0 ||
    improvements.length > 0 ||
    overall != null ||
    Object.values(cats || {}).some((v) => v != null);

  if (!hasData) {
    return (
      <Bg>
        <Wrap>
          <EmptyCard>
            <EmptyTitle>분석 결과가 아직 없어요</EmptyTitle>
            <EmptySub>채팅 후에 분석을 다시 시도해 주세요.</EmptySub>
            <EmptyActions>
              <PrimaryBtn onClick={() => navigate("/main")}>⟲ 다시 시작하기</PrimaryBtn>
            </EmptyActions>
          </EmptyCard>
        </Wrap>
      </Bg>
    );
  }

  const handleSave = () => {
    // TODO: 저장 API 연동 (예: POST /api/analysis)
    alert("저장되었습니다! (샘플)");
  };

  // 점수 카드/리스트/차트 렌더 → 원문 동일
  return (
    <Bg>
      <Wrap>
        <Hero>
          <HeroIcon>♡</HeroIcon>
          <HeroTitle>{name || "상대"}님과의 대화를 분석했어요</HeroTitle>
          <SaveBtn onClick={handleSave}>저장</SaveBtn>
        </Hero>

        <Row $cols={2}>
          <Card>
            <CardHead>
              <CardIcon>♡</CardIcon>
              <CardTitle>{name || "상대"}님의 호감도 지수</CardTitle>
            </CardHead>
            <ScoreBig>
              {likeScore != null ? likeScore : "-"}
              <small>점</small>
            </ScoreBig>
            <SubHint>100점 만점</SubHint>
          </Card>

          <Card>
            <CardHead>
              <CardIcon>💬</CardIcon>
              <CardTitle>{name || "상대"}님의 한마디</CardTitle>
            </CardHead>
            <Quote>{quote ? `“${quote}”` : "—"}</Quote>
          </Card>
        </Row>

        <Row $cols={3}>
          <Card>
            <CardHead>
              <CardIcon>🌱</CardIcon>
              <CardTitle>대화 흐름</CardTitle>
            </CardHead>
            {flow.length ? (
              <List>
                {flow.map((t, i) => (
                  <li key={i}>
                    <Num>{i + 1}</Num>
                    {t}
                  </li>
                ))}
              </List>
            ) : (
              <Muted>항목 없음</Muted>
            )}
          </Card>

          <Card>
            <CardHead>
              <CardIcon>🔎</CardIcon>
              <CardTitle>상대 성향 파악</CardTitle>
            </CardHead>
            {partnerTraits.length ? (
              <List>
                {partnerTraits.map((t, i) => (
                  <li key={i}>
                    <Num>{i + 1}</Num>
                    {t}
                  </li>
                ))}
              </List>
            ) : (
              <Muted>항목 없음</Muted>
            )}
          </Card>

          <Card>
            <CardHead>
              <CardIcon>🧭</CardIcon>
              <CardTitle>나의 대화 스타일</CardTitle>
            </CardHead>
            {myStyle.length ? (
              <List>
                {myStyle.map((t, i) => (
                  <li key={i}>
                    <Num>{i + 1}</Num>
                    {t}
                  </li>
                ))}
              </List>
            ) : (
              <Muted>항목 없음</Muted>
            )}
          </Card>
        </Row>

        <Row $cols={2}>
          <Card>
            <CardHead>
              <CardIcon>✅</CardIcon>
              <CardTitle>장점</CardTitle>
            </CardHead>
            {strengths.length ? (
              <List>
                {strengths.map((t, i) => (
                  <li key={i}>
                    <Bullet $good>●</Bullet>
                    {t}
                  </li>
                ))}
              </List>
            ) : (
              <Muted>항목 없음</Muted>
            )}
          </Card>

          <Card>
            <CardHead>
              <CardIcon>🛠</CardIcon>
              <CardTitle>보완할  점</CardTitle>
            </CardHead>
            {improvements.length ? (
              <List>
                {improvements.map((t, i) => (
                  <li key={i}>
                    <Bullet>●</Bullet>
                    {t}
                  </li>
                ))}
              </List>
            ) : (
              <Muted>항목 없음</Muted>
            )}
          </Card>
        </Row>

        <BigCard>
          <BigTitle>소개팅 종합 점수</BigTitle>
          <Overall>
            {overall != null ? overall : "-"}
            <small>점</small>
          </Overall>
          <SubHint>100점 만점</SubHint>

          <Divider />

          <SmallTitle>항목별 점수 (각 20점 만점)</SmallTitle>
          <Pills>
            <Pill>
              <span>🥰 매너</span>
              <b>{cats.manners != null ? cats.manners : "-"} / 20</b>
            </Pill>
            <Pill>
              <span>✨ 센스</span>
              <b>{cats.sense != null ? cats.sense : "-"} / 20</b>
            </Pill>
            <Pill>
              <span>💬 대화</span>
              <b>{cats.talk != null ? cats.talk : "-"} / 20</b>
            </Pill>
            <Pill>
              <span>❤️ 배려</span>
              <b>{cats.care != null ? cats.care : "-"} / 20</b>
            </Pill>
            <Pill>
              <span>😁 유머</span>
              <b>{cats.humor != null ? cats.humor : "-"} / 20</b>
            </Pill>
          </Pills>
        </BigCard>

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

/* SVG로 구현한 의존성 없는 RadarChart:
   data=[{key, v}], max=20 가정, size는 반지름 계산에 사용 */
function RadarChart({ data, max = 20, size = 320 }) {
  const R = size / 2 - 16;
  const cx = size / 2;
  const cy = size / 2;
  const n = data.length;

  const points = data.map((d, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const r = (d.v / max) * R;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });

  const grid = [0.25, 0.5, 0.75, 1].map((ratio, idx) => {
    const pts = data.map((_, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
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
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
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
        fill="rgba(124,58,237,.18)"
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

const LoadingWrap = styled.div`
  min-height: 100vh;
  padding-top: ${TOPBAR_H + 18}px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #ffb7d5 0%, #ff9ec2 40%, #ffb5d1 100%);
  color: #333;
  font-weight: 800;
`;

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
  width: 52px;
  height: 52px; 
  border-radius: 50%;
  border: 2px solid #ff2f79; 
  color: #ff2f79;
  display: grid; 
  place-items: center; 
  margin: 0 auto 8px;
  font-weight: 800;
`;
const HeroTitle = styled.h2`
  margin: 6px 0 0; color: #333;
`;
const SaveBtn = styled.button`
  position: absolute; 
  right: 14px; 
  top: 14px;
  height: 32px; 
  padding: 0 12px; 
  border-radius: 8px;
  border: 1.5px solid #e6e6e6; 
  background: #fff; 
  cursor: pointer; 
  font-weight: 700;
  &:hover { background: #fafafa; }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols || 2}, 1fr);
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
  display: flex; 
  align-items: center; 
  gap: 8px; 
  margin-bottom: 10px;
`;
const CardIcon = styled.span` font-size: 18px; `;
const CardTitle = styled.h3` font-size: 16px; margin: 0; color: #333; `;

const ScoreBig = styled.div`
  font-size: clamp(36px, 5vw, 44px);
  font-weight: 900; color: #10b981;
  small { font-size: .6em; margin-left: 2px; }
`;
const SubHint = styled.div`
  margin-top: 6px; 
  font-size: 12px; 
  color: #888;
`;
const Quote = styled.blockquote`
  margin: 6px 0 0; 
  color: #333; 
  line-height: 1.6;
`;

const List = styled.ol`
  margin: 0; 
  padding-left: 0; 
  list-style: none; 
  display: grid; 
  gap: 8px;
  li { display: flex; gap: 8px; color: #444; }
`;
const Num = styled.span`
  width: 22px; 
  height: 22px; 
  border-radius: 999px; 
  display: inline-grid; 
  place-items: center;
  background: #eef2ff; 
  color: #4f46e5; 
  font-size: 12px; 
  font-weight: 800;
`;
const Bullet = styled.span`
  color: ${({ $good }) => ($good ? "#10b981" : "#ef4444")};
  transform: translateY(1px);
`;
const Muted = styled.div`
  color: #999; font-size: 13px;
`;

const BigTitle = styled.h3`
  margin: 0 0 4px; 
  color: #333; 
  text-align: center;
`;
const Overall = styled.div`
  text-align: center;
  font-size: clamp(38px, 5.5vw, 46px);
  font-weight: 900; 
  color: #059669;
  small { font-size: .6em; margin-left: 2px; }
`;
const Divider = styled.div`
  height: 1px; 
  background: #f0f0f0; 
  margin: 14px 0 10px;
`;
const SmallTitle = styled.div`
  font-weight: 800; 
  color: #333; 
  margin-bottom: 10px;
`;
const Pills = styled.div`
  display: grid; 
  grid-template-columns: repeat(5, 1fr); 
  gap: 10px;
  @media (max-width: 960px) { grid-template-columns: repeat(2, 1fr); }
`;
const Pill = styled.div`
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  border: 1.5px solid #eef0f2; 
  border-radius: 10px; 
  padding: 10px 12px;
  background: #fff;
  span { color: #555; }
  b { color: #059669; }
`;

const ChartWrap = styled.div`
  display: grid; 
  place-items: center; 
  padding: 8px 0 2px;
`;

const BottomBar = styled.div`
  display: grid; 
  place-items: center; 
  margin-top: 6px;
`;
const RestartBtn = styled.button`
  height: 38px; 
  padding: 0 16px; 
  border-radius: 10px; 
  border: 0; 
  color: #fff; 
  font-weight: 800;
  background: linear-gradient(180deg,#ff3f8a 0%, #ff2f79 100%);
  box-shadow: 0 10px 22px rgba(255,47,121,.35);
  cursor: pointer;
`;

const EmptyCard = styled.section`
  background: #fff; 
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
  padding: 24px 22px; 
  text-align: center;
`;
const EmptyTitle = styled.h3`
  margin: 0; 
  color: #333;
`;
const EmptySub = styled.div`
  margin-top: 6px; 
  color: #777; 
  font-size: 14px;
`;
const EmptyActions = styled.div`
  margin-top: 12px;
`;
const PrimaryBtn = styled.button`
  height: 38px; 
  padding: 0 16px; 
  border-radius: 10px; 
  border: 0; color: #fff; 
  font-weight: 800;
  background: linear-gradient(180deg,#ff3f8a 0%, #ff2f79 100%);
  box-shadow: 0 10px 22px rgba(255,47,121,.35);
  cursor: pointer;
`;
