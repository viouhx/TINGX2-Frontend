import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const TOPBAR_H = 52;

export default function MyPage() {
  const navigate = useNavigate();

  // --- 더미 프로필 (API 붙이면 대체) ---
  const initialProfile = useMemo(
    () => ({
      nickname: "사용자",
      email: "asb0729@naver.com",
      gender: "여자",
      birth: "1995-01-01",
    }),
    []
  );

  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  const recent = [
    {
      id: "c_101",
      name: "희선님과의 대화",
      liked: 90,
      summary: "대화가 자연스럽고 유머가 있어서 즐거웠어요!",
      gender: "여자",
      age: 22,
      job: "디자이너",
      msgCount: 3,
      date: "2025. 8. 12.",
      tag: "독립적",
    },
    {
      id: "c_102",
      name: "지영님과의 대화",
      liked: 98,
      summary: "대화가 자연스럽고 유머가 있어서 즐거웠어요",
      gender: "여자",
      age: 24,
      job: "의사",
      msgCount: 5,
      date: "2025. 8. 12.",
      tag: "내향적",
    },
  ];

  // 간단 통계
  const stats = useMemo(() => {
    const total = recent.length;
    const avgLiked =
      Math.round((recent.reduce((a, b) => a + b.liked, 0) / Math.max(total, 1)) * 10) / 10;
    // 예시용 총점: 호감도*0.9 정도
    const avgTotal = Math.round(avgLiked * 0.93);
    return { total, avgLiked, avgTotal };
  }, [recent]);

  const startEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setEditing(false);
  };

  const saveEdit = () => {
    setProfile(draft);
    setEditing(false);
    setSavedOpen(true);
    setTimeout(() => setSavedOpen(false), 1200);
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
                <LightBtn onClick={startEdit}>
                  ✏️ 정보 수정
                </LightBtn>
              ) : (
                <>
                  <PrimaryBtn onClick={saveEdit}>💾 저장</PrimaryBtn>
                  <GhostBtn onClick={cancelEdit}>✖ 취소</GhostBtn>
                </>
              )}
            </HeadRight>
          </CardHead>

          <FormGrid>
            <Field>
              <Label>닉네임</Label>
              {editing ? (
                <Input
                  value={draft.nickname}
                  onChange={(e) => setDraft({ ...draft, nickname: e.target.value })}
                />
              ) : (
                <Value>{profile.nickname}</Value>
              )}
            </Field>
            <Field>
              <Label>이메일</Label>
              {editing ? (
                <Input
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              ) : (
                <Value>{profile.email}</Value>
              )}
            </Field>
            <Field>
              <Label>성별</Label>
              {editing ? (
                <Select
                  value={draft.gender}
                  onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
                >
                  <option>여자</option>
                  <option>남자</option>
                  <option>선택 안함</option>
                </Select>
              ) : (
                <Value>{profile.gender}</Value>
              )}
            </Field>
            <Field>
              <Label>생년월일</Label>
              {editing ? (
                <Input
                  value={draft.birth}
                  onChange={(e) => setDraft({ ...draft, birth: e.target.value })}
                />
              ) : (
                <Value>{profile.birth}</Value>
              )}
            </Field>
          </FormGrid>
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

          <List>
            {recent.map((r) => (
              <ListItem key={r.id}>
                <ListTop>
                  <LtLeft>
                    <BubbleIcon>💬</BubbleIcon>
                    <ItemTitle>{r.name}</ItemTitle>
                  </LtLeft>
                  <DatePill>{r.date}</DatePill>
                </ListTop>

                <MetaRow>
                  <MetaBox><MetaLabel>성별</MetaLabel><MetaVal>{r.gender}</MetaVal></MetaBox>
                  <MetaBox><MetaLabel>나이</MetaLabel><MetaVal>{r.age}세</MetaVal></MetaBox>
                  <MetaBox><MetaLabel>직업</MetaLabel><MetaVal>{r.job}</MetaVal></MetaBox>
                  <MetaBox><MetaLabel>메시지</MetaLabel><MetaVal>{r.msgCount}개</MetaVal></MetaBox>
                </MetaRow>

                <TagRow>
                  <Tag pink>호감도 {r.liked}점</Tag>
                  <Tag purple>총점 {Math.round(r.liked * 0.93)}점</Tag>
                  <SummaryChip>{r.summary}</SummaryChip>
                  <Chip>{r.tag}</Chip>
                </TagRow>

                <ItemActions>
                  <SmallBtn onClick={() => navigate("/analysis", { state: { chatId: r.id } })}>
                    📊 분석 보기
                  </SmallBtn>
                </ItemActions>
              </ListItem>
            ))}
          </List>
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
  box-shadow: 0 18px 64px rgba(0,0,0,.16);
  padding: 18px 16px 16px;
`;

const CardHead = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
`;
const HeadLeft = styled.div`display: flex; align-items: center; gap: 10px;`;
const HeadRight = styled.div`display: flex; gap: 8px;`;
const IconRound = styled.div`
  width: 36px; height: 36px; border-radius: 999px; display: grid; place-items: center;
  background: #ffe2ec; font-size: 18px;
`;
const HeadTitle = styled.h3`margin: 0;`;

const PrimaryBtn = styled.button`
  height: 34px; padding: 0 12px; border-radius: 10px; border: 0; color: #fff; font-weight: 800;
  background: linear-gradient(180deg,#ff3f8a 0%, #ff2f79 100%);
  box-shadow: 0 8px 18px rgba(255,47,121,.3); cursor: pointer;
`;
const LightBtn = styled.button`
  height: 32px; padding: 0 10px; border-radius: 8px; border: 1px solid #ffd0e1;
  background: #fff; color: #ff2f79; font-weight: 700; cursor: pointer;
`;
const GhostBtn = styled.button`
  height: 32px; padding: 0 10px; border-radius: 8px; border: 1px solid #eee;
  background: #fff; color: #666; cursor: pointer;
`;

/* 프로필 */
const FormGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  @media (max-width: 640px){ grid-template-columns: 1fr; }
`;
const Field = styled.div`
  display: grid; gap: 6px;
`;
const Label = styled.div`font-size: 13px; color: #777;`;
const Value = styled.div`
  height: 40px; display: grid; align-items: center;
  background: #fafafa; border: 1.5px solid #eee; border-radius: 10px; padding: 0 12px;
`;
const Input = styled.input`
  height: 40px; border-radius: 10px; border: 1.5px solid #e6e6e6; padding: 0 12px;
  &:focus{ outline: none; border-color: #ff7aa7; box-shadow: 0 0 0 3px rgba(255,122,167,.15);}
`;
const Select = styled.select`
  height: 40px; border-radius: 10px; border: 1.5px solid #e6e6e6; padding: 0 12px;
`;

/* 리스트 */
const List = styled.div`display: grid; gap: 12px;`;
const ListItem = styled.div`
  border: 1px solid #f3f3f3; border-radius: 14px; padding: 12px; background: #fff;
`;
const ListTop = styled.div`display: flex; justify-content: space-between; align-items: center;`;
const LtLeft = styled.div`display: flex; align-items: center; gap: 8px;`;
const BubbleIcon = styled.div`width: 26px; height: 26px; border-radius: 999px; display: grid; place-items: center; background: #ffeaf2;`;
const ItemTitle = styled.div`font-weight: 800;`;
const DatePill = styled.div`
  height: 26px; display: grid; place-items: center; padding: 0 10px; border-radius: 999px; background: #f7f7f7; color: #666; font-size: 12px;
`;

const MetaRow = styled.div`
  margin-top: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  @media (max-width: 760px){ grid-template-columns: repeat(2, 1fr); }
`;
const MetaBox = styled.div`
  background: #fafafa; border: 1px solid #f1f1f1; border-radius: 10px; padding: 10px;
`;
const MetaLabel = styled.div`font-size: 12px; color: #888;`;
const MetaVal = styled.div`font-weight: 800; margin-top: 2px;`;

const TagRow = styled.div`display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;`;
const Tag = styled.span`
  padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 800;
  ${({ pink }) =>
    pink
      ? `background: #ffe6f0; color: #ff2f79;`
      : `background: #efe9ff; color: #6b5bff;`}
`;
const SummaryChip = styled.span`
  padding: 6px 10px; border-radius: 10px; font-size: 12px; background: #f7f7f7; color: #555;
`;
const Chip = styled.span`
  padding: 6px 10px; border-radius: 999px; font-size: 12px; background: #eefbf0; color: #22a559; font-weight: 700;
`;

const ItemActions = styled.div`margin-top: 10px; display: flex; justify-content: flex-end;`;
const SmallBtn = styled.button`
  height: 30px; padding: 0 10px; border-radius: 8px; border: 1px solid #e9e9e9; background: #fff; cursor: pointer; font-weight: 700;
  &:hover{ background: #f9fafb; }
`;

/* 통계 */
const StatRow = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;`;
const StatCard = styled.div`
  background: #fff; border-radius: 14px; border: 1px solid #f1f1f1; padding: 18px 12px; text-align: center;
  box-shadow: 0 10px 26px rgba(0,0,0,.06);
`;
const StatNum = styled.div`font-size: 28px; font-weight: 900; color: #111;`;
const StatLabel = styled.div`font-size: 12px; color: #777; margin-top: 4px;`;

/* 저장 알림 */
const Toast = styled.div`
  position: fixed; inset: 0; display: grid; place-items: center; z-index: 50; background: rgba(0,0,0,.25);
`;
const ToastInner = styled.div`
  background: #fff; padding: 16px 20px; border-radius: 12px; font-weight: 800;
  box-shadow: 0 16px 44px rgba(0,0,0,.25);
`;
