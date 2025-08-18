// src/components/mypage.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getMe, updateNickname } from "../api/auth";
import { getChatSessions } from "../api/chat";

const TOPBAR_H = 52;

function toYmdDot(d) {
  try {
    const dt = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    return `${dt.getFullYear()}. ${dt.getMonth() + 1}. ${dt.getDate()}.`;
  } catch {
    return "";
  }
}

/** 백엔드 UserDto → 화면용으로 통일 */
function normalizeProfile(d = {}) {
  const nickname = d.nickname ?? d.nickName ?? d.usNickname ?? d.name ?? "";
  const email = d.email ?? d.usEmail ?? d.userEmail ?? "";

  const rawGender = (d.gender ?? d.usGender ?? d.userGender ?? "")
    .toString()
    .toLowerCase();
  const gender =
    rawGender === "male" || rawGender === "m" || rawGender === "남"
      ? "남자"
      : rawGender === "female" || rawGender === "f" || rawGender === "여"
      ? "여자"
      : (d.gender || "-");

  // 서버가 '나이'를 usAge/age로 줄 수도, 생일을 birth/birthDate로 줄 수도 있어 방어적으로 처리
  const ageOrBirth =
    d.age ??
    d.usAge ??
    d.birth ??
    d.birthDate ??
    d.usBirth ??
    d.usBirthDate ??
    "";

  return { nickname, email, gender, birth: ageOrBirth };
}

/**
 * 최근 대화 카드용 표준화(기본 문구/추정값 제거)
 */
function normSession(s = {}) {
  const id = s.sessionId ?? s.id ?? null;
  const partner =
    s.partnerName ?? s.opponentName ?? s.targetName ?? s.aiName ?? "상대방";

  const liked =
    s.favorability ??
    s.likeability ??
    s.likeabilityScore ??
    s.favorabilityScore ??
    null;

  const total = s.totalScore ?? s.overallScore ?? null;

  const gender = s.gender ?? s.partnerGender ?? s.aiGender ?? "";
  const age = Number(s.age ?? s.partnerAge ?? s.aiAge ?? "") || null;
  const job = s.job ?? s.partnerJob ?? s.aiJob ?? "";
  const msgCount = s.messageCount ?? s.msgCount ?? s.totalMessages ?? 0;
  const date = toYmdDot(
    s.createdAt ?? s.created_at ?? s.startedAt ?? Date.now()
  );

  const summaryRaw = s.summary ?? s.oneLiner ?? s.oneLineSummary ?? null;
  const tagRaw = s.tag ?? s.partnerTrait ?? null;
  const summary =
    typeof summaryRaw === "string" && summaryRaw.trim()
      ? summaryRaw.trim()
      : null;
  const tag =
    typeof tagRaw === "string" && tagRaw.trim() ? tagRaw.trim() : null;

  return {
    id,
    name: `${partner}님과의 대화`,
    liked, // null 가능
    total, // null 가능
    gender:
      gender === "male" ? "남자" : gender === "female" ? "여자" : String(gender || "-"),
    age,
    job,
    msgCount,
    date,
    summary, // null 가능
    tag, // null 가능
  };
}

export default function MyPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [draftNick, setDraftNick] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  // 프로필
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await getMe(); // { usNickname, usEmail, ... }
        if (!alive) return;
        const p = normalizeProfile(data);
        setProfile(p);
        setDraftNick(p.nickname || "");
      } catch (e) {
        console.error("[mypage] getMe fail:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 최근 대화
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await getChatSessions();
        const arr = Array.isArray(data) ? data : data?.sessions || [];
        const norm = arr.map(normSession);
        if (!alive) return;
        setRecent(norm);
      } catch (e) {
        console.error("[mypage] sessions fail:", e);
        if (!alive) return;
        setRecent([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* ===== 통계(서버가 준 값만 집계) =====
     - 평균 호감도: liked !== null 인 항목만
     - 평균 총점: total !== null 인 항목만 */
  const stats = useMemo(() => {
    const likes = recent.map((r) => r.liked).filter((v) => v != null);
    const totals = recent.map((r) => r.total).filter((v) => v != null);

    const avgLiked = likes.length
      ? Math.round((likes.reduce((a, b) => a + b, 0) / likes.length) * 10) / 10
      : 0;

    const avgTotal = totals.length
      ? Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) / 10
      : 0;

    return { total: recent.length, avgLiked, avgTotal };
  }, [recent]);

  // 닉네임 편집
  const startEdit = () => setEditing(true);
  const cancelEdit = () => {
    setDraftNick(profile?.nickname || "");
    setEditing(false);
  };

  const saveEdit = async () => {
    if (!profile) return;
    if (!draftNick.trim()) {
      alert("닉네임을 입력해 주세요.");
      return;
    }
    try {
      setSaving(true);
      await updateNickname(draftNick.trim());
      setProfile((p) => ({ ...p, nickname: draftNick.trim() }));
      setEditing(false);
      setSavedOpen(true);
      setTimeout(() => setSavedOpen(false), 1200);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "닉네임 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Bg>
      <Wrap>
        {/* 프로필 카드 */}
        <Card>
          <CardHead>
            <HeadLeft>
              <IconRound>👤</IconRound>
              <HeadTitle>프로필 정보</HeadTitle>
            </HeadLeft>
            <HeadRight>
              {!editing ? (
                <LightBtn onClick={startEdit}>✏️ 닉네임 수정</LightBtn>
              ) : (
                <>
                  <PrimaryBtn onClick={saveEdit} disabled={saving}>
                    {saving ? "저장중..." : "💾 저장"}
                  </PrimaryBtn>
                  <GhostBtn onClick={cancelEdit} disabled={saving}>
                    ✖ 취소
                  </GhostBtn>
                </>
              )}
            </HeadRight>
          </CardHead>

          {!profile ? (
            <Dim>불러오는 중...</Dim>
          ) : (
            <FormGrid>
              <Field>
                <Label>닉네임</Label>
                {editing ? (
                  <Input
                    value={draftNick}
                    onChange={(e) => setDraftNick(e.target.value)}
                  />
                ) : (
                  <Value>{profile.nickname}</Value>
                )}
              </Field>

              <Field>
                <Label>이메일</Label>
                <Value title="이메일은 서버에서 수정 불가">
                  {profile.email || "-"}
                </Value>
              </Field>

              <Field>
                <Label>성별</Label>
                <Value title="성별은 서버에서 수정 불가">
                  {profile.gender || "-"}
                </Value>
              </Field>

              <Field>
                <Label>나이</Label>
                <Value title="서버가 나이(usAge/age) 또는 생일(birth/birthDate)을 줄 수 있어요">
                  {profile.birth
                    ? /^\d+$/.test(String(profile.birth))
                      ? `${profile.birth}세`
                      : String(profile.birth)
                    : "-"}
                </Value>
              </Field>
            </FormGrid>
          )}
        </Card>

        {/* 최근 대화 기록 */}
        <Card>
          <CardHead>
            <HeadLeft>
              <IconRound>💬</IconRound>
              <HeadTitle>최근 대화 기록</HeadTitle>
            </HeadLeft>
            <HeadRight>
              <LightBtn onClick={() => navigate("/history")}>전체 보기</LightBtn>
            </HeadRight>
          </CardHead>

          {loading ? (
            <Dim>불러오는 중...</Dim>
          ) : recent.length === 0 ? (
            <Dim>최근 대화가 없어요.</Dim>
          ) : (
            <List>
              {recent.slice(0, 5).map((r) => (
                <ListItem key={r.id || Math.random()}>
                  <ListTop>
                    <LtLeft>
                      <BubbleIcon>💬</BubbleIcon>
                      <ItemTitle>{r.name}</ItemTitle>
                    </LtLeft>
                    <DatePill>{r.date}</DatePill>
                  </ListTop>

                  <MetaRow>
                    <MetaBox>
                      <MetaLabel>성별</MetaLabel>
                      <MetaVal>{r.gender}</MetaVal>
                    </MetaBox>
                    <MetaBox>
                      <MetaLabel>나이</MetaLabel>
                      <MetaVal>{r.age ? `${r.age}세` : "-"}</MetaVal>
                    </MetaBox>
                    <MetaBox>
                      <MetaLabel>직업</MetaLabel>
                      <MetaVal>{r.job || "-"}</MetaVal>
                    </MetaBox>
                    <MetaBox>
                      <MetaLabel>메시지</MetaLabel>
                      <MetaVal>{r.msgCount}개</MetaVal>
                    </MetaBox>
                  </MetaRow>

                  <TagRow>
                    {r.liked != null && <Tag pink>호감도 {r.liked}점</Tag>}
                    {r.total != null && <Tag purple>총점 {r.total}점</Tag>}
                    {r.summary && <SummaryChip>{r.summary}</SummaryChip>}
                    {r.tag && <Chip>{r.tag}</Chip>}
                  </TagRow>

                  <ItemActions>
                    <SmallBtn
                      onClick={() =>
                        navigate("/analysis", {
                          state: {
                            sessionId: r.id,
                            name: r.name.replace("님과의 대화", ""),
                          },
                        })
                      }
                      disabled={!r.id}
                      title={r.id ? "" : "세션 ID 없음"}
                    >
                      📊 분석 보기
                    </SmallBtn>
                  </ItemActions>
                </ListItem>
              ))}
            </List>
          )}
        </Card>

        {/* 소개팅 통계 */}
        <Card>
          <CardHead>
            <HeadLeft>
              <IconRound>📈</IconRound>
              <HeadTitle>나의 소개팅 통계</HeadTitle>
            </HeadLeft>
          </CardHead>

          <StatRow>
            <StatCard>
              <StatNum>{stats.total}</StatNum>
              <StatLabel>총 대화 수</StatLabel>
            </StatCard>
            <StatCard>
              <StatNum>{stats.avgLiked}</StatNum>
              <StatLabel>평균 호감도</StatLabel>
            </StatCard>
            <StatCard>
              <StatNum>{stats.avgTotal}</StatNum>
              <StatLabel>평균 총점</StatLabel>
            </StatCard>
          </StatRow>
        </Card>
      </Wrap>

      {/* 저장 완료 모달 */}
      {savedOpen && (
        <Toast>
          <ToastInner>저장되었습니다.</ToastInner>
        </Toast>
      )}
    </Bg>
  );
}

/* ========== styles ========== */
const Bg = styled.main`
  min-height: 100vh;
  padding-top: ${TOPBAR_H + 24}px;
  padding-bottom: 40px;
  background: linear-gradient(135deg, #ffb7d5 0%, #ff9ec2 40%, #ffb5d1 100%);
`;
const Wrap = styled.div`
  width: min(1024px, 92vw);
  margin: 0 auto;
  display: grid;
  gap: 18px;
`;

const Card = styled.section`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 18px 64px rgba(0, 0, 0, 0.16);
  padding: 18px 16px 16px;
`;

const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;
const HeadLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HeadRight = styled.div`
  display: flex;
  gap: 8px;
`;

const IconRound = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #ffe2ec;
  font-size: 18px;
`;
const HeadTitle = styled.h3`
  margin: 0;
`;

const PrimaryBtn = styled.button`
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 0;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(180deg, #ff3f8a 0%, #ff2f79 100%);
  box-shadow: 0 8px 18px rgba(255, 47, 121, 0.3);
  cursor: pointer;
`;
const LightBtn = styled.button`
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #ffd0e1;
  background: #fff;
  color: #ff2f79;
  font-weight: 700;
  cursor: pointer;
`;
const GhostBtn = styled.button`
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #fff;
  color: #666;
  cursor: pointer;
`;

const Dim = styled.div`
  background: #fafafa;
  border: 1px dashed #eee;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  color: #777;
`;

/* 프로필 */
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;
const Field = styled.div`
  display: grid;
  gap: 6px;
`;

const Label = styled.div`
  font-size: 13px;
  color: #777;
`;

const Value = styled.div`
  height: 40px;
  display: grid;
  align-items: center;
  background: #fafafa;
  border: 1.5px solid #eee;
  border-radius: 10px;
  padding: 0 12px;
`;
const Input = styled.input`
  height: 40px;
  border-radius: 10px;
  border: 1.5px solid #e6e6e6;
  padding: 0 12px;
  &:focus {
    outline: none;
    border-color: #ff7aa7;
    box-shadow: 0 0 0 3px rgba(255, 122, 167, 0.15);
  }
`;

/* 리스트 */
const List = styled.div`
  display: grid;
  gap: 12px;
`;

const ListItem = styled.div`
  border: 1px solid #f3f3f3;
  border-radius: 14px;
  padding: 12px;
  background: #fff;
`;
const ListTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LtLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BubbleIcon = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #ffeaf2;
`;

const ItemTitle = styled.div`
  font-weight: 800;
`;

const DatePill = styled.div`
  height: 26px;
  display: grid;
  place-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: #f7f7f7;
  color: #666;
  font-size: 12px;
`;

const MetaRow = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  @media (max-width: 760px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MetaBox = styled.div`
  background: #fafafa;
  border: 1px solid #f1f1f1;
  border-radius: 10px;
  padding: 10px;
`;

const MetaLabel = styled.div`
  font-size: 12px;
  color: #888;
`;

const MetaVal = styled.div`
  font-weight: 800;
  margin-top: 2px;
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
const SummaryChip = styled.span`
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

const ItemActions = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
`;

const SmallBtn = styled.button`
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e9e9e9;
  background: #fff;
  cursor: pointer;
  font-weight: 700;
  &:hover {
    background: #f9fafb;
  }
`;

/* 통계 */
const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid #f1f1f1;
  padding: 18px 12px;
  text-align: center;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.06);
`;

const StatNum = styled.div`
  font-size: 28px;
  font-weight: 900;
  color: #111;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #777;
  margin-top: 4px;
`;

/* 저장 알림 */
const Toast = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 50;
  background: rgba(0, 0, 0, 0.25);
`;

const ToastInner = styled.div`
  background: #fff;
  padding: 16px 20px;
  border-radius: 12px;
  font-weight: 800;
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.25);
`;
