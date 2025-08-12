import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const TOPBAR_H = 52;

export default function RecentChats() {
  const navigate = useNavigate();

  const list = [
    {
      id: "c_101",
      name: "희선님과의 대화",
      gender: "여자",
      age: 22,
      job: "디자이너",
      msgCount: 3,
      liked: 90,
      total: 88,
      summary: "대화가 자연스럽고 유머가 있어서 즐거웠어요!",
      tag: "독립적",
      date: "2025. 8. 12.",
    },
    {
      id: "c_102",
      name: "지영님과의 대화",
      gender: "여자",
      age: 24,
      job: "의사",
      msgCount: 5,
      liked: 98,
      total: 93,
      summary: "대화가 자연스럽고 유머가 있어서 즐거웠어요",
      tag: "내향적",
      date: "2025. 8. 12.",
    },
  ];

  return (
    <Bg>
      <Wrap>
        <TopBar>
          <Back onClick={() => navigate(-1)}>← 마이페이지로</Back>
          <Title>대화 기록</Title>
        </TopBar>

        <List>
          {list.map((r) => (
            <Item key={r.id}>
              <ItemHead>
                <Left>
                  <Icon>💬</Icon>
                  <ItemTitle>{r.name}</ItemTitle>
                </Left>
                <Right>
                  <SmallLight>📅 {r.date}</SmallLight>
                  <SmallBtn onClick={() => navigate("/analysis", { state: { chatId: r.id } })}>
                    📊 분석 보기
                  </SmallBtn>
                </Right>
              </ItemHead>

              <Line />

              <MetaRow>
                <Meta>성별 <b>{r.gender}</b></Meta>
                <Meta>나이 <b>{r.age}세</b></Meta>
                <Meta>직업 <b>{r.job}</b></Meta>
                <Meta>메시지 <b>{r.msgCount}개</b></Meta>
              </MetaRow>

              <TagRow>
                <Tag pink>호감도 {r.liked}점</Tag>
                <Tag purple>총점 {r.total}점</Tag>
                <Summary>{r.summary}</Summary>
                <Chip>{r.tag}</Chip>
              </TagRow>
            </Item>
          ))}
        </List>
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
const TopBar = styled.div`display: flex; align-items: center; gap: 10px; margin-bottom: 14px;`;
const Back = styled.button`
  border: 0; background: transparent; cursor: pointer; font-weight: 800; color: #444;
`;
const Title = styled.h2`margin: 0;`;

const List = styled.div`display: grid; gap: 16px;`;
const Item = styled.section`
  background: #fff; border-radius: 16px; padding: 14px 14px 12px;
  box-shadow: 0 18px 64px rgba(0,0,0,.16);
`;
const ItemHead = styled.div`display: flex; justify-content: space-between; align-items: center; gap: 10px;`;
const Left = styled.div`display: flex; align-items: center; gap: 8px;`;
const Right = styled.div`display: flex; align-items: center; gap: 8px;`;
const Icon = styled.div`width: 28px; height: 28px; border-radius: 999px; display: grid; place-items: center; background: #ffeaf2;`;
const ItemTitle = styled.div`font-weight: 900;`;
const SmallLight = styled.div`
  height: 28px; padding: 0 10px; border-radius: 999px; background: #f6f6f6; display: grid; place-items: center; font-size: 12px; color: #666;
`;
const SmallBtn = styled.button`
  height: 30px; padding: 0 10px; border-radius: 8px; border: 1px solid #e9e9e9; background: #fff; cursor: pointer; font-weight: 700;
  &:hover{ background: #f9fafb; }
`;
const Line = styled.div`height: 1px; background: #f1f1f1; margin: 10px 0;`;

const MetaRow = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  @media (max-width: 760px){ grid-template-columns: repeat(2, 1fr); }
`;
const Meta = styled.div`
  background: #fafafa; border: 1px solid #f1f1f1; border-radius: 10px; padding: 10px; color: #666;
  b{ color: #111; margin-left: 6px; }
`;

const TagRow = styled.div`display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;`;
const Tag = styled.span`
  padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 800;
  ${({ pink }) =>
    pink
      ? `background: #ffe6f0; color: #ff2f79;`
      : `background: #efe9ff; color: #6b5bff;`}
`;
const Summary = styled.span`padding: 6px 10px; border-radius: 10px; font-size: 12px; background: #f7f7f7; color: #555;`;
const Chip = styled.span`padding: 6px 10px; border-radius: 999px; font-size: 12px; background: #eefbf0; color: #22a559; font-weight: 700;`;
