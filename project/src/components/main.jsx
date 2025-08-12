// src/components/main.jsx
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const JOBS = [
  "회사원","공무원","의사","간호사","교사","개발자","디자이너","마케터","영업","자영업",
  "학생","변호사","약사","회계사","금융","컨설턴트","연구원","데이터사이언티스트","PD","작가"
];
const TALK_STYLES = ["리드형","수다쟁이","차분한","조용한","유머러스","진지한","감성적","논리적","다정한","솔직한","친근한","정중한"];
const TRAITS = ["유머","진지","활발","감성적","이성적","외향적","내향적","낙천적","신중한","열정적","친화적","독립적","배려심","창의적","현실적"];
const HOBBIES = ["영화","음악","운동","독서","여행","요리","게임","드라마","패션","미술","사진","댄스","카페","맛집","술","커피","반려동물","자동차"];

const TOTAL_STEPS = 7; // 0~6

export default function Main() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("wizard"); // 'wizard' | 'review'
  const [step, setStep] = useState(0);

  // form states
  const [name, setName] = useState("");
  const [gender, setGender] = useState(""); // "male" | "female"
  const [age, setAge] = useState("");
  const [job, setJob] = useState("");
  const [jobQuery, setJobQuery] = useState("");
  const [talkStyles, setTalkStyles] = useState([]);
  const [traits, setTraits] = useState([]);
  const [hobbies, setHobbies] = useState([]);

  // validations
  const v0 = useMemo(() => name.trim().length > 0, [name]);
  const v1 = useMemo(() => gender === "male" || gender === "female", [gender]);
  const v2 = useMemo(() => {
    const n = Number(age);
    return Number.isInteger(n) && n >= 1 && n <= 100;
  }, [age]);
  const v3 = useMemo(() => job.trim().length > 0, [job]);
  const v4 = useMemo(() => talkStyles.length > 0, [talkStyles]);
  const v5 = useMemo(() => traits.length > 0, [traits]);
  const v6 = useMemo(() => hobbies.length > 0, [hobbies]);
  const canNext = [v0, v1, v2, v3, v4, v5, v6][step];

  const filteredJobs = useMemo(() => {
    const q = jobQuery.trim();
    if (!q) return JOBS;
    return JOBS.filter((j) => j.toLowerCase().includes(q.toLowerCase()));
  }, [jobQuery]);

  const toggle = (arr, set, item) => {
    set(arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item]);
  };

  const resetAll = () => {
    setStep(0);
    setName("");
    setGender("");
    setAge("");
    setJob("");
    setJobQuery("");
    setTalkStyles([]);
    setTraits([]);
    setHobbies([]);
  };

  const onOpen = () => { resetAll(); setMode("wizard"); setOpen(true); };
  const onClose = () => setOpen(false);

  const next = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  // 마지막 단계에서 "채팅 시작" → 리뷰 모달로 전환
  const goReview = () => setMode("review");

  // 리뷰 모달: 채팅 시작
  const startChat = () => {
    onClose();
    navigate("/chat");
  };

  // 숫자만 입력 (1~100)
  const handleAgeChange = (v) => {
    const onlyNum = v.replace(/\D/g, "");
    setAge(onlyNum.slice(0, 3));
  };

  // 조사(과/와) 자동 선택
  const hasJong = (word) => {
    if (!word) return false;
    const ch = word[word.length - 1];
    const code = ch.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return false;
    return ((code - 0xac00) % 28) !== 0;
  };
  const chatBtnText = `${name || "상대방"}${hasJong(name || "상대방") ? "과" : "와"} 채팅 시작하기`;

  return (
    <Bg>
      <Header>TINGTING</Header>

      <IntroCard>
        <Heart>♡</Heart>
        <IntroTitle>AI 소개팅 시뮬레이션</IntroTitle>
        <IntroDesc>
          안녕하세요, 사용자님!
          <br />
          원하는 상대방의 조건을 설정하고 AI와 채팅을 시작해보세요
        </IntroDesc>
        <Primary onClick={onOpen}>상대방 조건 설정하기</Primary>
      </IntroCard>

      {open && (
        <Overlay onClick={onClose}>
          {/* ======= Wizard ======= */}
          {mode === "wizard" && (
            <Modal onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <TopRow>
                <Steps>
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <Dot key={i} $active={i <= step} />
                  ))}
                </Steps>
                <StepNum>{step + 1}/{TOTAL_STEPS}</StepNum>
                <Close onClick={onClose}>×</Close>
              </TopRow>

              {step === 0 && (
                <StepSection>
                  <HeadBlock>
                    <H1>상대방 이름을 설정해주세요</H1>
                    <P>채팅하고 싶은 상대방의 이름을 입력해주세요</P>
                  </HeadBlock>
                  <BodyBlock>
                    <CenterWrap>
                      <Input
                        placeholder="예: 차연"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </CenterWrap>
                  </BodyBlock>
                </StepSection>
              )}

              {step === 1 && (
                <StepSection>
                  <HeadBlock>
                    <H1>성별을 선택해주세요</H1>
                    <P>선호하는 상대방의 성별을 선택해주세요</P>
                  </HeadBlock>
                  <BodyBlock>
                    <CenterWrap>
                      <TwoCols>
                        <Choice $selected={gender === "male"} onClick={() => setGender("male")}>
                          <Icon>👤</Icon>
                          남자
                        </Choice>
                        <Choice $selected={gender === "female"} onClick={() => setGender("female")}>
                          <Icon>👤</Icon>
                          여자
                        </Choice>
                      </TwoCols>
                    </CenterWrap>
                  </BodyBlock>
                </StepSection>
              )}

              {step === 2 && (
                <StepSection>
                  <HeadBlock>
                    <H1>나이를 입력해주세요</H1>
                    <P>선호하는 상대방의 나이를 입력해주세요</P>
                  </HeadBlock>
                  <BodyBlock>
                    <CenterWrap>
                      <Input
                        inputMode="numeric"
                        placeholder="1 ~ 100"
                        value={age}
                        onChange={(e) => handleAgeChange(e.target.value)}
                      />
                      <SubHint>1-100 사이의 숫자를 입력해주세요</SubHint>
                    </CenterWrap>
                  </BodyBlock>
                </StepSection>
              )}

              {step === 3 && (
                <Content>
                  <Group>
                    <H1>직업을 선택해주세요</H1>
                    <P>선호하는 상대방의 직업을 선택해주세요</P>
                    <Search
                      placeholder="직업을 검색하거나 아래에서 선택하세요"
                      value={jobQuery}
                      onChange={(e) => setJobQuery(e.target.value)}
                    />
                    <TagWrap>
                      {filteredJobs.map((j) => (
                        <Tag
                          key={j}
                          $active={job === j}
                          onClick={() => setJob(job === j ? "" : j)}
                        >
                          {j}
                        </Tag>
                      ))}
                    </TagWrap>
                  </Group>
                </Content>
              )}

              {step === 4 && (
                <Content>
                  <Group>
                    <H1>말투 스타일을 선택해주세요</H1>
                    <P>선호하는 말투 스타일을 선택해주세요 (복수 선택 가능)</P>
                    <TagWrap>
                      {TALK_STYLES.map((s) => (
                        <Tag
                          key={s}
                          $active={talkStyles.includes(s)}
                          onClick={() => toggle(talkStyles, setTalkStyles, s)}
                        >
                          {s}
                        </Tag>
                      ))}
                    </TagWrap>
                  </Group>
                </Content>
              )}

              {step === 5 && (
                <Content>
                  <Group>
                    <H1>성격을 선택해주세요</H1>
                    <P>선호하는 성격을 선택해주세요 (복수 선택 가능)</P>
                    <TagWrap>
                      {TRAITS.map((t) => (
                        <Tag
                          key={t}
                          $active={traits.includes(t)}
                          onClick={() => toggle(traits, setTraits, t)}
                        >
                          {t}
                        </Tag>
                      ))}
                    </TagWrap>
                  </Group>
                </Content>
              )}

              {step === 6 && (
                <Content>
                  <Group>
                    <H1>관심사를 선택해주세요</H1>
                    <P>선호하는 관심사를 선택해주세요 (복수 선택 가능)</P>
                    <TagWrap>
                      {HOBBIES.map((h) => (
                        <Tag
                          key={h}
                          $active={hobbies.includes(h)}
                          onClick={() => toggle(hobbies, setHobbies, h)}
                        >
                          {h}
                        </Tag>
                      ))}
                    </TagWrap>
                  </Group>
                </Content>
              )}

              <BtnRow>
                <Ghost onClick={prev} disabled={step === 0}>← 이전</Ghost>
                {step < TOTAL_STEPS - 1 ? (
                  <Next onClick={next} disabled={!canNext}>다음 →</Next>
                ) : (
                  <Next onClick={goReview} disabled={!canNext}>채팅 시작</Next>
                )}
              </BtnRow>
            </Modal>
          )}

          {/* ======= Review ======= */}
          {mode === "review" && (
            <Modal onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <CloseRow>
                <span />
                <Close onClick={onClose}>×</Close>
              </CloseRow>

              <div style={{ textAlign: "center" }}>
                <HeartLg>♡</HeartLg>
                <IntroTitle>AI 소개팅 시뮬레이션</IntroTitle>
                <IntroDesc>
                  안녕하세요, 사용자님!
                  <br />
                  원하는 상대방의 조건을 설정하고 AI와 채팅을 시작해보세요
                </IntroDesc>
              </div>

              <SummaryTitle>설정된 조건</SummaryTitle>
              <SummaryBox>
                <SummaryRow><b>이름:</b> {name}</SummaryRow>
                <SummaryRow><b>성별:</b> {gender === "male" ? "남자" : "여자"}</SummaryRow>
                <SummaryRow><b>나이:</b> {age}세</SummaryRow>
                <SummaryRow><b>직업:</b> {job}</SummaryRow>
                <SummaryRow><b>말투:</b> {talkStyles.join(", ")}</SummaryRow>
                <SummaryRow><b>성격:</b> {traits.join(", ")}</SummaryRow>
                <SummaryRow><b>관심사:</b> {hobbies.join(", ")}</SummaryRow>
              </SummaryBox>

              <ReviewBtnCol>
                <Primary onClick={startChat}>
                  💬 {chatBtnText}
                </Primary>
                <Outline onClick={() => { setMode("wizard"); setStep(0); }}>
                  조건 다시 설정하기
                </Outline>
              </ReviewBtnCol>
            </Modal>
          )}
        </Overlay>
      )}
    </Bg>
  );
}

/* ===== styles ===== */
const Bg = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #ffb7d5 0%, #ff9ec2 40%, #ffb5d1 100%);
  padding: 24px;
`;
const Header = styled.div`
  position: fixed; top: 12px; left: 24px;
  color: #fff; font-weight: 800; letter-spacing: 1px;
`;
const IntroCard = styled.section`
  width: min(92vw, 520px);
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
  text-align: center;
`;
const Heart = styled.div`
  width: 52px; height: 52px; border-radius: 50%;
  border: 2px solid #ff2f79; color: #ff2f79;
  display: grid; place-items: center; margin: 0 auto 10px;
  font-weight: 800;
`;
const HeartLg = styled(Heart)`
  width: 56px; height: 56px; font-size: 22px;
`;
const IntroTitle = styled.h2` margin: 6px 0 8px; `;
const IntroDesc = styled.p` margin: 0 0 16px; color: #555; line-height: 1.5; `;
const Primary = styled.button`
  width: 100%;
  height: 46px;
  border-radius: 999px;
  border: 0;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(180deg,#ff3f8a 0%, #ff2f79 100%);
  box-shadow: 0 10px 22px rgba(255,47,121,.35);
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
  &:hover { transform: translateY(-1px); filter: brightness(1.02); }
`;
const Outline = styled.button`
  width: 100%;
  height: 46px;
  border-radius: 999px;
  border: 2px solid #ff2f79;
  color: #ff2f79;
  background: #fff;
  font-weight: 800;
  cursor: pointer;
`;

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  display: grid; place-items: center;
`;
const Modal = styled.div`
  width: min(92vw, 600px);
  background: #fff; border-radius: 16px;
  padding: 28px 28px 24px;
  box-shadow: 0 30px 80px rgba(0,0,0,.35);
  min-height: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;
const TopRow = styled.div`
  display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 12px;
`;
const CloseRow = styled.div`
  display: grid; grid-template-columns: 1fr auto; align-items: center; margin-bottom: 4px;
`;
const Steps = styled.div` display: flex; gap: 8px; align-items: center; `;
const Dot = styled.div`
  width: 38px; height: 6px; border-radius: 6px;
  background: ${({ $active }) => ($active ? "#333" : "#e6e6e6")};
`;
const StepNum = styled.div` font-size: 14px; color: #888; `;
const Close = styled.button`
  border: 0; background: transparent; font-size: 22px; cursor: pointer; color: #888;
  &:hover { color: #444; }
`;

/* 공통 내용 래퍼 */
const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
const Group = styled.div`
  width: min(100%, 440px);
  margin: 0 auto;
`;

const H1 = styled.h3` margin: 18px 0 8px; `;
const P  = styled.p`  margin: 0 0 18px; color: #666; `;
const SubHint = styled.div` margin-top: 6px; font-size: 12px; color: #888; `;

const Input = styled.input`
  width: 100%; height: 46px;
  border-radius: 10px;
  border: 1.5px solid #e6e6e6; padding: 0 12px; font-size: 15px;
  &:focus { outline: none; border-color: #ff7aa7; box-shadow: 0 0 0 3px rgba(255,122,167,.15); }
`;
const Search = styled(Input)``;

/* 상단 고정 + 중앙 입력 */
const StepSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
const HeadBlock = styled.div``;
const BodyBlock = styled.div`
  flex: 1;
  display: grid;
  place-items: center;
`;
const CenterWrap = styled.div`
  width: min(100%, 440px);
`;

const TwoCols = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px;
`;
const Choice = styled.button`
  height: 240px;
  border-radius: 14px; width: 100%;
  border: 2px solid ${({ $selected }) => ($selected ? "#ff2f79" : "#e6e6e6")};
  background: ${({ $selected }) => ($selected ? "linear-gradient(180deg,#ff3f8a 0%, #ff2f79 100%)" : "#fff")};
  color: ${({ $selected }) => ($selected ? "#fff" : "#333")};
  font-weight: 800; cursor: pointer;
  box-shadow: ${({ $selected }) => ($selected ? "0 10px 22px rgba(255,47,121,.35)" : "none")};
  display: grid; place-items: center; gap: 8px;
  transition: transform .14s ease, box-shadow .14s ease, border-color .14s ease, filter .14s ease;
  will-change: transform;
  &:hover {
    transform: translateY(-2px);
    ${({ $selected }) => $selected ? `
      filter: brightness(1.03);
      box-shadow: 0 14px 28px rgba(255,47,121,.38);
    ` : `
      border-color: #ff2f79;
      box-shadow: 0 14px 28px rgba(255,47,121,.22);
    `}
  }
  &:active { transform: translateY(0); box-shadow: none; }
  &:focus-visible { outline: 3px solid rgba(255,47,121,.35); outline-offset: 2px; }
`;
const Icon = styled.div` font-size: 56px; `;

const TagWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 10px;
  max-height: 340px;
  overflow: auto;
  padding-right: 2px;
`;
const Tag = styled.button`
  border-radius: 999px; padding: 10px 14px; border: 2px solid #e6e6e6;
  background: ${({ $active }) => ($active ? "#ff2f79 100%" : "#fff")};
  color: ${({ $active }) => ($active ? "#fff" : "#333")};
  font-weight: 700; cursor: pointer; text-align: center;
  border-color: ${({ $active }) => ($active ? "#ff2f79" : "#e6e6e6")};
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .12s ease, color .12s ease;
  will-change: transform;
  &:hover {
    ${({ $active }) => $active ? `
      transform: translateY(-1px);
      box-shadow: 0 10px 22px rgba(0,0,0,.18), 0 10px 22px rgba(255,47,121,.25);
      filter: brightness(1.03);
    ` : `
      transform: translateY(-1px);
      border-color: #ff2f79;
      color: #ff2f79;
      background: rgba(255,47,121,.08);
      box-shadow: 0 8px 18px rgba(255,47,121,.18);
    `}
  }
  &:focus-visible { outline: 3px solid rgba(255,47,121,.35); outline-offset: 2px; }
`;

const BtnRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 16px;
`;
const Ghost = styled.button`
  padding: 10px 14px; border-radius: 10px; border: 1px solid #ddd; background: #fff; cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;
const Next = styled.button`
  padding: 10px 18px; border-radius: 10px; border: 0; color: #fff; font-weight: 800;
  background: ${({ disabled }) => (disabled ? "#d9d9d9" : "linear-gradient(180deg,#111 0%, #222 100%)")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

/* Review styles */
const SummaryTitle = styled.h4`
  text-align: center;
  margin: 12px 0 8px;
  color: #333;
`;
const SummaryBox = styled.div`
  width: min(100%, 480px);
  margin: 0 auto 14px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 14px 16px;
  color: #333;
`;
const SummaryRow = styled.div`
  font-size: 14px;
  line-height: 1.7;
  & + & { margin-top: 4px; }
`;
const ReviewBtnCol = styled.div`
  width: min(100%, 480px);
  margin: 10px auto 0;
  display: grid;
  gap: 10px;
`;
