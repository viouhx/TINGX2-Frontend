import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { createConditions, startChat as startChatApi } from "../api/chat";

/* =========================
   랜딩 페이지에서 쓸 외부 링크 (여기만 바꾸면 됨)
   ========================= */
const LINKS = {
  mbti: "https://www.16personalities.com/ko",       // MBTI 테스트 링크
  loveStyle: "https://smore.im/quiz/F9mbcorgGH",    // 연애스타일 테스트 링크
  etiquette: "https://blog.naver.com/rizzlines/223684632366",  // 소개팅 매너 가이드 링크
  video: "https://www.youtube.com/watch?v=mYoXYhX7tes",        // 소개팅 대화법 영상(Youtube) 링크
};

/* =========================
   기존 모달 데이터
   ========================= */
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

  /* ===== 모달 상태 ===== */
  const [open, setOpen] = useState(false); // 모달 열림
  const [mode, setMode] = useState("wizard"); // 'wizard' | 'review'
  const [step, setStep] = useState(0); // 스텝 인덱스(0~6)

  // 폼 입력값들
  const [name, setName] = useState("");
  const [gender, setGender] = useState(""); // "male" | "female"
  const [age, setAge] = useState(""); // 문자열 입력 → 숫자 변환은 유효성에서
  const [job, setJob] = useState("");
  const [jobQuery, setJobQuery] = useState("");
  const [talkStyles, setTalkStyles] = useState([]); // 배열
  const [traits, setTraits] = useState([]);         // 배열
  const [hobbies, setHobbies] = useState([]);   
  const [starting, setStarting] = useState(false); // 리뷰 모달에서 "채팅 시작" 로딩

  // 각 스텝 유효성
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

  // 현재 스텝에 해당하는 유효성만 보고 '다음/시작' 버튼 활성화
  const canNext = [v0, v1, v2, v3, v4, v5, v6][step];

  // 직업 검색 필터
  const filteredJobs = useMemo(() => {
    const q = jobQuery.trim();
    if (!q) return JOBS;
    return JOBS.filter((j) => j.toLowerCase().includes(q.toLowerCase()));
  }, [jobQuery]);

  // 다중선택 토글 유틸
  const toggle = (arr, set, item) => {
    set(arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item]);
  };

  // 모달 초기화
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

  // 스텝 이동
  const next = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  // 마지막 스텝에서 '채팅 시작'을 누르면 리뷰 화면으로
  const goReview = () => setMode("review");

  /* ===== 리뷰 화면 → 실제로 채팅 세션 시작 ===== */
  const startChat = async () => {
    if (starting) return;
   const opponent = {
     name: name || "상대방",
     age: Number(age) || null,
     job,
     gender,
     talkStyles,
     traits,
     hobbies,
   };
   const defaultHello =
     `안녕하세요! ${opponent.name}${hasJong(opponent.name) ? "이에요" : "예요"}. 어떤 이야기부터 시작할까요?`;

    // 전체 세션 생성 횟수 제한(로컬Storage로 관리)
    const TOTAL_LIMIT = 7;
    const isLocal = (sid) => String(sid || "").startsWith("local-");
   const getSessionList = () => {
     try { return JSON.parse(localStorage.getItem("tt_sessions") || "[]"); }
     catch { return []; }
   };
   const addSessionOnce = (sid) => {
     if (!sid || isLocal(sid)) return; // 로컬 세션은 카운트 제외
     const list = getSessionList();
     if (!list.includes(sid)) {
       list.push(sid);
       localStorage.setItem("tt_sessions", JSON.stringify(list));
     }
   };

    // 1) 마법사에서 입력한 조건을 백엔드 DTO에 맞춰 구성
    const payload = {
      name,
      gender,
      age: Number(age), 
      job,
      talkStyles,
      traits,
      hobbies,
    };

    try {
      setStarting(true);
      // 2) 조건 생성 API → conditionId
      const { data: cond } = await createConditions(payload);
      const conditionId = cond?.conditionId ?? cond?.id;

      // 3) 대화 세션 시작 API → sessionId/첫 인사/상대이름
      let sessionId;
      let aiHello;
      let opponentName;
      
      
      if (conditionId != null) {
        const { data: started } = await startChatApi({ conditionId });
        sessionId   = started?.sessionId ?? started?.id;
        aiHello     = started?.aiMessage || defaultHello; // ★ HTTP 응답의 첫 인사 사용
        opponentName =
          started?.partnerName ||
          started?.opponentName ||
          started?.targetName ||
          name ||
          "상대방";
      }

      // 전체 세션 7회 제한: 새 세션일 때만 체크
     if (sessionId && !isLocal(sessionId)) {
       const list = getSessionList();
       if (!list.includes(sessionId) && list.length >= TOTAL_LIMIT) {
         alert("전체 채팅 가능 횟수(7회)를 모두 사용하셨습니다.");
         onClose();
         return;
       }
       addSessionOnce(sessionId);
     }

      onClose();

      // 4) Chat 화면으로 세션/첫 인사/상대이름 전달
       
     navigate("/chat", {
       state: { sessionId, aiHello, opponent: { ...opponent, name: opponentName } }
     });
    } catch (e) {
      // 6) API 실패 시: 로컬 세션으로 폴백해서 UX 유지
      console.error("[startChat] API 실패, 로컬 폴백으로 이동:", e);
      onClose();
      // 10회 제한/배지 작동
     const localId = `local-${Date.now()}`;
     navigate("/chat", {
       state: { sessionId: localId, aiHello: defaultHello, opponent }
     });
    } finally {
      setStarting(false);
    }
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

      {/* ======= 랜딩 Hero ======= */}
      <Container>
        <Hero>
          <HeroTitle>안녕하세요, 사용자님! <i>💞</i></HeroTitle>
          <HeroSub>오늘도 새로운 인연과 만날 준비가 되셨나요?</HeroSub>
          <HeroCta onClick={onOpen}>➕ 새로운 소개팅 시작하기</HeroCta>
        </Hero>

        {/* 사용법 4단계 */}
        <Card>
          <CardHead>
            <HeadIcon>🔔</HeadIcon>
            <h3>TingTing 사용법</h3>
          </CardHead>
          <StepsGrid>
            <StepItem>
              <Num>1</Num>
              <StepTitle>조건 설정</StepTitle>
              <StepDesc>원하는 상대방의 나이, 성격, 관심사 등을 설정해보세요</StepDesc>
            </StepItem>
            <StepItem>
              <Num>2</Num>
              <StepTitle>AI 채팅</StepTitle>
              <StepDesc>설정한 조건에 맞는 AI와 자연스럽게 대화해봐요</StepDesc>
            </StepItem>
            <StepItem>
              <Num>3</Num>
              <StepTitle>분석 확인</StepTitle>
              <StepDesc>대화 내용을 AI가 분석한 결과를 확인해요</StepDesc>
            </StepItem>
            <StepItem>
              <Num>4</Num>
              <StepTitle>실력 향상</StepTitle>
              <StepDesc>피드백을 바탕으로 대화 스킬을 조금씩 높여요</StepDesc>
            </StepItem>
          </StepsGrid>
        </Card>

        {/* 2열: 왼쪽(특별함) / 오른쪽(꿀팁 & 링크) */}
        <TwoCol>
          <Card>
            <CardHead>
              <HeadIcon>✨</HeadIcon>
              <h3>TingTing만의 특별함</h3>
            </CardHead>
            <Bullets>
              <li><b>AI 맞춤 대화</b><span> · 원하는 조건의 상대와 자연스러운 대화</span></li>
              <li><b>정밀한 분석</b><span> · 대화 스타일과 매력 포인트를 AI가 분석</span></li>
              <li><b>성장 피드백</b><span> · 개선점과 장점을 구체적으로 제시</span></li>
              <li><b>실전 연습</b><span> · 부담 없이 스킬을 향상시키는 안전한 연습</span></li>
            </Bullets>
          </Card>

          <Card>
            <CardHead>
              <HeadIcon>🧠</HeadIcon>
              <h3>소개팅 꿀팁 & 유용한 링크</h3>
            </CardHead>

            <Tips>
              <TipBox>
                <TipTitle>대화 시작하기</TipTitle>
                <TipText>프로필을 보고 구체적인 질문으로 자연스럽게 시작해보세요.</TipText>
              </TipBox>
              <TipBox>
                <TipTitle>경청의 기술</TipTitle>
                <TipText>상대 말에 “맞아요, 저도 그렇게 생각해요” 같은 공감표현을 섞어보세요.</TipText>
              </TipBox>
              <TipBox>
                <TipTitle>질문의 기술</TipTitle>
                <TipText>예/아니오로 끝나는 질문보다 경험을 꺼내는 열린 질문이 좋아요.</TipText>
              </TipBox>
            </Tips>

            <Links>
              <li><a href={LINKS.mbti} target="_blank" rel="noreferrer">🔗 MBTI 성격유형 테스트</a></li>
              <li><a href={LINKS.loveStyle} target="_blank" rel="noreferrer">🔗 연애스타일 테스트</a></li>
              <li><a href={LINKS.etiquette} target="_blank" rel="noreferrer">🔗 소개팅 매너 가이드</a></li>
              <li><a href={LINKS.video} target="_blank" rel="noreferrer">🔗 소개팅 대화법 영상 (YouTube)</a></li>
            </Links>
          </Card>
        </TwoCol>

        {/* 하단 3특징 */}
        <Features3>
          <FeatureCard>
            <FeatIcon>🛡️</FeatIcon>
            <FeatTitle>안전한 연습 환경</FeatTitle>
            <FeatText>실제 상황에 대한 부담 없이 편안하게 스킬을 연습해요.</FeatText>
          </FeatureCard>
          <FeatureCard>
            <FeatIcon>⚡</FeatIcon>
            <FeatTitle>즉시 피드백</FeatTitle>
            <FeatText>AI가 결과를 바로 분석해 개선점을 파악할 수 있어요.</FeatText>
          </FeatureCard>
          <FeatureCard>
            <FeatIcon>🎯</FeatIcon>
            <FeatTitle>맞춤형 상대방</FeatTitle>
            <FeatText>원하는 조건의 상대와 대화하며 다양한 상황에 대비해요.</FeatText>
          </FeatureCard>
        </Features3>

        {/* Footer */}
        <Footer>
          <FootCols>
            <div>
              <Brand>TingTing</Brand>
              <Small>AI 기술로 완성하는<br/>스마트한 소개팅 시뮬레이션 서비스</Small>
              <Copy>© 2025 TingTing. All rights reserved.</Copy>
            </div>

            <div>
              <FootTitle>Contact</FootTitle>
              <Small>📞 010-4709-2597</Small>
              <Small>✉ asb0729@naver.com</Small>
              <Small>📍 뉴욕 자유의 여신상 앞 벤치</Small>
              <Small>🕘 평일 09:00 ~ 18:00 (주말/공휴일 휴무)</Small>
            </div>

            <div>
              <FootTitle>관리자 정보</FootTitle>
              <Small>웹 서비스 담당자: 안승빈</Small>
              <Small>백엔드 담당자: 조건호</Small>
              <Small>데이터베이스 관리자: 전준영</Small>
              <Small style={{opacity:.8, marginTop:6}}>
                문의사항이 있으면 언제든지 연락주세요.
              </Small>
            </div>
          </FootCols>
        </Footer>
      </Container>

      {/* ======= 기존 모달(마법사 & 리뷰) 그대로 ======= */}
      {open && (
        <Overlay onClick={onClose}>
          {/* Wizard */}
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
                        placeholder="예: 지수"
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
                          <Icon>👤</Icon>남자
                        </Choice>
                        <Choice $selected={gender === "female"} onClick={() => setGender("female")}>
                          <Icon>👤</Icon>여자
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

          {/* Review */}
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
                  안녕하세요, 사용자님!<br />
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
                <Primary onClick={startChat} disabled={starting}>
                  {starting ? "시작 중..." : `💬 ${chatBtnText}`}
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

const Bg = styled.main`
  min-height: 100vh;
  background: linear-gradient(135deg, #ffb7d5 0%, #ff9ec2 40%, #ffb5d1 100%);
  padding: 24px 0 48px;
`;
const Header = styled.div`
  position: fixed; 
  top: 12px; 
  left: 24px;
  color: #fff; 
  font-weight: 800; 
  letter-spacing: 1px;
`;

const Container = styled.div`
  width: min(1100px, 92vw);
  margin: 72px auto 0;
`;

const Hero = styled.section`
  text-align: center;
  margin-bottom: 18px;
`;
const HeroTitle = styled.h1`
  font-size: clamp(26px, 3.6vw, 36px);
  color: #fff;
  text-shadow: 0 6px 16px rgba(0,0,0,.18), 0 2px 0 rgba(255,255,255,.35);
  margin: 0 0 6px;
`;
const HeroSub = styled.p`
  color: #ffe7f1; 
  margin: 0 0 14px;
`;
const Primary = styled.button`
  width: 100%;
  height: 46px;
  border-radius: 999px;
  border: 0;
  font-weight: 800;
  color: #fff;
  background: ${({ disabled }) =>
    disabled ? "#d9d9d9" : "linear-gradient(180deg,#ff3f8a 0%, #ff2f79 100%)"};
  box-shadow: ${({ disabled }) =>
    disabled ? "none" : "0 10px 22px rgba(255,47,121,.35)"};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
  &:hover { transform: ${({ disabled }) => (disabled ? "none" : "translateY(-1px)")};
            filter: ${({ disabled }) => (disabled ? "none" : "brightness(1.02)")};
  }
`;
const HeroCta = styled(Primary)`
  width: auto; padding: 0 18px; display: inline-flex; align-items: center; gap: 6px;
`;

const Card = styled.section`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
  padding: 20px 18px;
  margin: 16px 0;
`;
const CardHead = styled.div`
  display: flex; 
  align-items: center; 
  gap: 8px; 
  margin-bottom: 10px;
  h3 { margin: 0; }
`;
const HeadIcon = styled.span` font-size: 18px; `;

const StepsGrid = styled.div`
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 14px;
  @media (max-width: 900px){ grid-template-columns: repeat(2, 1fr); }
`;
const StepItem = styled.div`
  background: #fafafa; 
  border: 1px solid #f0f0f0; 
  border-radius: 12px;
  padding: 14px; 
  text-align: center;
`;
const Num = styled.div`
  width: 36px; 
  height: 36px; 
  line-height: 36px; 
  margin: 0 auto 8px;
  border-radius: 999px; 
  font-weight: 800; 
  color: #ff2f79; 
  background: #ffe9f1;
`;
const StepTitle = styled.div` 
font-weight: 800; 
margin-bottom: 6px; `;

const StepDesc = styled.div` 
font-size: 13px; 
color: #666; `;

const TwoCol = styled.div`
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 16px;
  @media (max-width: 960px){ grid-template-columns: 1fr; }
`;
const Bullets = styled.ul`
  margin: 0; 
  padding: 0 0 0 0; 
  list-style: none;
  li { padding: 10px 12px; border-radius: 10px; background:#fafafa; border:1px solid #f0f0f0; }
  li + li { margin-top: 8px; }
  b { color: #111; }
  span { color: #666; }
`;

const Tips = styled.div`
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 8px; 
  margin-bottom: 10px;
`;
const TipBox = styled.div`
  background: #fff7fb; 
  border: 1px solid #ffecf4;
  border-radius: 10px; 
  padding: 10px 12px;
`;
const TipTitle = styled.div` 
font-weight: 800; 
color: #ff2f79; 
margin-bottom: 4px; `;

const TipText  = styled.div` 
color: #555; 
font-size: 13px; `;

const Links = styled.ul`
  margin: 8px 0 0; 
  padding: 0; 
  list-style: none;
  li + li { margin-top: 6px; }
  a { color: #333; text-decoration: none; font-weight: 700; }
  a:hover { text-decoration: underline; }
`;

const Features3 = styled.div`
  display: grid; 
  grid-template-columns: repeat(3, 1fr); 
  gap: 16px; 
  margin-top: 8px;
  @media (max-width: 960px){ grid-template-columns: 1fr; }
`;
const FeatureCard = styled.div`
  background: #fff; 
  border-radius: 16px; 
  box-shadow: 0 10px 30px rgba(0,0,0,.12);
  padding: 18px 16px; 
  text-align: center;
`;
const FeatIcon = styled.div` 
font-size: 28px; `;

const FeatTitle = styled.div` 
font-weight: 800; 
margin: 6px 0; `;

const FeatText  = styled.div` 
color:#666; 
font-size: 13px; `;

const Footer = styled.footer`
  margin-top: 20px; 
  padding: 18px 0 8px; 
  color: #fff;
`;
const FootCols = styled.div`
  display: grid; 
  grid-template-columns: 1.3fr 1fr 1fr; 
  gap: 24px;
  @media (max-width: 960px){ grid-template-columns: 1fr; gap: 12px; }
`;
const Brand = styled.div` 
font-weight: 900; 
font-size: 18px; 
margin-bottom: 6px; `;

const FootTitle = styled.div` 
font-weight: 900; 
margin-bottom: 8px; `;

const Small = styled.div` 
font-size: 13px; 
opacity: .95; `;

const Copy = styled.div` 
font-size: 12px; 
margin-top: 8px; 
opacity: .85; `;

const Overlay = styled.div`
  position: fixed; 
  inset: 0;
  background: rgba(0,0,0,.45);
  display: grid; 
  place-items: center;
`;
const Modal = styled.div`
  width: min(92vw, 600px);
  background: #fff; 
  border-radius: 16px;
  padding: 28px 28px 24px;
  box-shadow: 0 30px 80px rgba(0,0,0,.35);
  min-height: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;
const TopRow = styled.div`
  display: grid; 
  grid-template-columns: 1fr auto auto; 
  align-items: center; 
  gap: 12px;
`;
const CloseRow = styled.div`
  display: grid; 
  grid-template-columns: 1fr auto; 
  align-items: center; 
  margin-bottom: 4px;
`;
const Steps = styled.div` 
display: flex; 
gap: 8px; 
align-items: center; `;

const Dot = styled.div`
  width: 38px; 
  height: 6px; 
  border-radius: 6px;
  background: ${({ $active }) => ($active ? "#333" : "#e6e6e6")};
`;
const StepNum = styled.div` 
font-size: 14px; 
color: #888; `;

const Close = styled.button`
  border: 0; 
  background: transparent; 
  font-size: 22px; 
  cursor: pointer; 
  color: #888;
  &:hover { color: #444; }
`;
const HeartLg = styled.div`
  width: 56px; 
  height: 56px; 
  border-radius: 50%;
  border: 2px solid #ff2f79; 
  color: #ff2f79;
  display: grid; 
  place-items: center; 
  margin: 0 auto 10px;
  font-weight: 800; 
  font-size: 22px;
`;
const IntroTitle = styled.h2` 
margin: 6px 0 8px; `;

const IntroDesc  = styled.p` 
margin: 0 0 16px; 
color: #555; 
line-height: 1.5; `;

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

const Content = styled.div`
  flex: 1; 
  display: flex; 
  flex-direction: column;
`;
const Group = styled.div`
  width: min(100%, 440px);
  margin: 0 auto;
`;
const H1 = styled.h3` 
margin: 18px 0 8px; `;

const P  = styled.p`  
margin: 0 0 18px; 
color: #666; `;

const SubHint = styled.div` 
margin-top: 6px; 
font-size: 12px; 
color: #888; `;

const Input = styled.input`
  width: 100%; 
  height: 46px; 
  border-radius: 10px;
  border: 1.5px solid #e6e6e6; 
  padding: 0 12px; 
  font-size: 15px;
  &:focus { outline: none; 
  border-color: #ff7aa7; 
  box-shadow: 0 0 0 3px rgba(255,122,167,.15); 
  }
`;
const Search = styled(Input)``;

/* 상단 고정 + 중앙 입력 */
const StepSection = styled.div` 
display: flex; 
flex-direction: column; 
flex: 1; `;

const HeadBlock = styled.div``;

const BodyBlock = styled.div` 
flex: 1; 
display: grid; 
place-items: center; `;

const CenterWrap = styled.div` 
width: min(100%, 440px); `;

const TwoCols = styled.div`
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 20px; 
  margin-top: 10px;
`;
const Choice = styled.button`
  height: 240px; 
  border-radius: 14px; 
  width: 100%;
  border: 2px solid ${({ $selected }) => ($selected ? "#ff2f79" : "#e6e6e6")};
  background: ${({ $selected }) => ($selected ? "linear-gradient(180deg,#ff3f8a 0%, #ff2f79 100%)" : "#fff")};
  color: ${({ $selected }) => ($selected ? "#fff" : "#333")};
  font-weight: 800; cursor: pointer;
  box-shadow: ${({ $selected }) => ($selected ? "0 10px 22px rgba(255,47,121,.35)" : "none")};
  display: grid; 
  place-items: center; 
  gap: 8px;
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
  border-radius: 999px; 
  padding: 10px 14px; 
  border: 2px solid #e6e6e6;
  background: ${({ $active }) => ($active ? "linear-gradient(180deg,#ff3f8a 0%, #ff2f79 100%)" : "#fff")};
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
  padding: 10px 14px; 
  border-radius: 10px; 
  border: 1px solid #ddd; 
  background: #fff; 
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;
const Next = styled.button`
  padding: 10px 18px; 
  border-radius: 10px; 
  border: 0; 
  color: #fff; 
  font-weight: 800;
  background: ${({ disabled }) => (disabled ? "#d9d9d9" : "linear-gradient(180deg,#111 0%, #222 100%)")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

const SummaryTitle = styled.h4`
  text-align: 
  center; 
  margin: 12px 0 8px; 
  color: #333;
`;
const SummaryBox = styled.div`
  width: min(100%, 480px);
  margin: 0 auto 14px;
  background: #fafafa; border: 1px solid #eee; 
  border-radius: 10px;
  padding: 14px 16px; 
  color: #333;
`;
const SummaryRow = styled.div`
  font-size: 14px; 
  line-height: 1.7; & + & { margin-top: 4px; }
`;
const ReviewBtnCol = styled.div`
  width: min(100%, 480px); 
  margin: 10px auto 0; 
  display: grid; 
  gap: 10px;
`;
