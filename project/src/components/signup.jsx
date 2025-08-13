import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [birth, setBirth] = useState(""); // yyyy-mm-dd
  const [gender, setGender] = useState(""); // 'male' | 'female'

  const [emailChecked, setEmailChecked] = useState(false);
  const [nickChecked, setNickChecked] = useState(false);

  // ✅ 이메일 인증 관련
  const [emailVerifySent, setEmailVerifySent] = useState(false); // 인증 메일 발송됨
  const [emailVerified, setEmailVerified] = useState(false);     // 인증 완료됨

  const [showDone, setShowDone] = useState(false);

  // 유효성
  const emailValid = useMemo(() => emailRegex.test(email), [email]);
  const nickValid = useMemo(() => nickname.trim().length >= 2 && nickname.trim().length <= 7, [nickname]);
  const pwdValid = useMemo(() => pwd.trim().length >= 6, [pwd]); // 예시 규칙
  const pwdSame = useMemo(() => pwd !== "" && pwd === pwd2, [pwd, pwd2]);
  const birthValid = useMemo(() => birth.trim() !== "", [birth]);
  const genderValid = useMemo(() => gender === "male" || gender === "female", [gender]);

  // 최종 버튼 활성 조건: 모든 필드 채움 + 유효 + 중복확인 + ✅ 이메일 인증 완료
  const canSubmit =
    emailValid &&
    nickValid &&
    pwdValid &&
    pwdSame &&
    birthValid &&
    genderValid &&
    emailChecked &&
    nickChecked &&
    emailVerified;

  const handleEmailCheck = () => {
    if (!emailValid) return;
    // TODO: 실제 중복 체크 API
    setEmailChecked(true);
    alert("사용 가능한 이메일입니다.");
  };

  const handleNickCheck = () => {
    if (!nickValid) return;
    // TODO: 실제 중복 체크 API
    setNickChecked(true);
    alert("사용 가능한 닉네임입니다.");
  };

  // ✅ 인증 메일 보내기
  const handleSendVerifyEmail = () => {
    if (!emailChecked || !emailValid) return;
    // TODO: 실제 인증 메일 발송 API
    setEmailVerifySent(true);
    alert("인증 메일을 보냈습니다. 메일함에서 확인 후 '이메일 확인'을 눌러주세요.");
  };

  // ✅ 메일에서 확인 후 버튼 눌러 인증 완료 처리
  const handleConfirmEmail = () => {
    if (!emailVerifySent) return;
    // TODO: 실제 인증 확인 API (토큰 검증 등)
    setEmailVerified(true);
    alert("이메일 인증이 완료되었습니다.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: 회원가입 API
    setShowDone(true);
    setTimeout(() => {
      setShowDone(false);
      navigate("/login");
    }, 1200);
  };

  // 입력이 바뀌면 다시 중복확인/인증 필요
  const onChangeEmail = (v) => {
    setEmail(v);
    setEmailChecked(false);
    setEmailVerifySent(false);
    setEmailVerified(false);
  };
  const onChangeNick = (v) => {
    setNickname(v);
    setNickChecked(false);
  };

  return (
    <Bg>
      <Top>
        <Logo>TingTing</Logo>
        <BackLink to="/login">← 로그인으로</BackLink>
      </Top>

      <Card as="form" onSubmit={handleSubmit}>
        <Brand>TingTing</Brand>
        <Title>회원가입</Title>

        {/* 이메일 */}
        <Inline>
          <Input
            placeholder="이메일"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            autoComplete="email"
          />
          <SmallBtn
            type="button"
            disabled={!emailValid}
            onClick={handleEmailCheck}
          >
            중복확인
          </SmallBtn>
        </Inline>
        {email !== "" && (
          <Hint ok={emailValid}>
            {emailValid ? "사용 가능한 이메일입니다." : "이메일 형식이 올바르지 않습니다."}
          </Hint>
        )}

        {/* ✅ 이메일 인증 흐름 */}
        {emailChecked && (
          <>
            <RightAlign>
              {!emailVerifySent && !emailVerified && (
                <SmallBtn type="button" onClick={handleSendVerifyEmail}>
                  이메일 인증
                </SmallBtn>
              )}
              {emailVerifySent && !emailVerified && (
                <SmallBtn type="button" onClick={handleConfirmEmail}>
                  이메일 확인
                </SmallBtn>
              )}
              {emailVerified && (
                <SmallBtn type="button" disabled>
                  인증 완료
                </SmallBtn>
              )}
            </RightAlign>

            {!emailVerified && emailVerifySent && (
              <Hint ok={false}>
                메일함에서 인증을 완료하신 뒤, 위의 <b>이메일 확인</b> 버튼을 눌러주세요.
              </Hint>
            )}
            {emailVerified && (
              <Hint ok={true}>이메일 인증이 완료되었습니다.</Hint>
            )}
          </>
        )}

        {/* 닉네임 */}
        <Inline>
          <Input
            placeholder="닉네임 (2~7자)"
            value={nickname}
            onChange={(e) => onChangeNick(e.target.value)}
          />
          <SmallBtn
            type="button"
            disabled={!nickValid}
            onClick={handleNickCheck}
          >
            중복확인
          </SmallBtn>
        </Inline>
        {nickname !== "" && (
          <Hint ok={nickValid}>
            {nickValid ? "사용 가능한 닉네임입니다." : "닉네임은 2~7자여야 합니다."}
          </Hint>
        )}

        {/* 비밀번호 */}
        <Input
          placeholder="비밀번호 (6자 이상)"
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          autoComplete="new-password"
        />
        <Input
          placeholder="비밀번호 확인"
          type="password"
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
          autoComplete="new-password"
        />
        {pwd2 !== "" && (
          <Hint ok={pwdSame}>{pwdSame ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}</Hint>
        )}

        {/* 생년월일 */}
        <Input
          type="date"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
        />

        {/* 성별 */}
        <GenderRow>
          <GenderBtn
            type="button"
            $active={gender === "male"}
            onClick={() => setGender("male")}
          >
            남
          </GenderBtn>
          <GenderBtn
            type="button"
            $active={gender === "female"}
            onClick={() => setGender("female")}
          >
            여
          </GenderBtn>
        </GenderRow>

        <PrimaryBtn type="submit" disabled={!canSubmit}>
          회원가입
        </PrimaryBtn>
      </Card>

      {showDone && (
        <ModalBG>
          <ModalCard>회원가입이 성공적으로 완료되었습니다!</ModalCard>
        </ModalBG>
      )}
    </Bg>
  );
};

export default Signup;

/* ===== styles ===== */
const Bg = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #ffb7d5 0%, #ff9ec2 40%, #ffb5d1 100%);
  padding: 24px;
`;

const Top = styled.div`
  position: absolute; top: 28px; left: 0; right: 0;
  display: flex; justify-content: center;
`;

const Logo = styled.h2`
  color: #fff; font-size: clamp(24px, 3.8vw, 36px);
  text-shadow: 0 6px 16px rgba(0,0,0,.18), 0 2px 0 rgba(255,255,255,.35);
`;

const BackLink = styled(Link)`
  position: absolute; top: 8px; right: min(4vw, 24px);
  color: rgba(255,255,255,.95); font-weight: 700; text-decoration: none;
`;

const Card = styled.section`
  width: min(92vw, 460px);
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
`;

const Brand = styled.h3`
  color: #ff2f79;
  font-weight: 800;
  text-align: center;
  margin: 0 0 4px;
`;

const Title = styled.h1`
  font-size: 22px;
  text-align: center;
  margin: 0 0 18px;
`;

const Input = styled.input`
  width: 100%;
  height: 44px;
  border-radius: 10px;
  border: 1.5px solid #e6e6e6;
  padding: 0 12px;
  margin-bottom: 10px;
  font-size: 15px;
  &:focus { outline: none; border-color: #ff7aa7; box-shadow: 0 0 0 3px rgba(255, 122, 167, .15); }
`;

const Inline = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px;
  gap: 8px;
  align-items: center;
`;

const SmallBtn = styled.button`
  height: 44px;
  border-radius: 10px;
  border: 2px solid #ff2f79;
  background: #fff;
  color: #ff2f79;
  font-weight: 800;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const RightAlign = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: -2px 0 8px;
`;

const Hint = styled.div`
  margin: -6px 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ ok }) => (ok ? "#1cb04e" : "#e05252")};
`;

const GenderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 6px 0 10px;
`;

const GenderBtn = styled.button`
  height: 42px;
  border-radius: 999px;
  border: 2px solid #ff2f79;
  background: ${({ $active }) => ($active ? "linear-gradient(180deg,#ff3f8a 0%, #ff2f79 100%)" : "#fff")};
  color: ${({ $active }) => ($active ? "#fff" : "#ff2f79")};
  font-weight: 800;
  cursor: pointer;
`;

const PrimaryBtn = styled.button`
  width: 100%;
  height: 46px;
  border-radius: 999px;
  border: 0;
  font-weight: 800;
  color: #fff;
  background: ${({ disabled }) => (disabled ? "#d9d9d9" : "linear-gradient(180deg,#ff3f8a 0%, #ff2f79 100%)")};
  box-shadow: ${({ disabled }) => (disabled ? "none" : "0 10px 22px rgba(255,47,121,.35)")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: transform .12s ease;
  margin-top: 8px;
  &:hover { transform: ${({ disabled }) => (disabled ? "none" : "translateY(-1px)")}; }
`;

const ModalBG = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.35);
  display: grid; place-items: center;
`;

const ModalCard = styled.div`
  background: #fff; padding: 18px 22px; border-radius: 12px;
  font-weight: 800;
`;
