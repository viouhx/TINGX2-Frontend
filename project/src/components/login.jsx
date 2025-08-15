// src/components/login.jsx
import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { signIn, getMe } from "../api/auth";

// 🔑 백엔드 베이스 URL (http.js와 동일한 규칙으로 해석)
//   - REACT_APP_API_BASE 가 있으면 그걸 쓰고
//   - 없으면 REACT_APP_API_BASE_URL
//   - 둘 다 없으면 로컬 8080 추정
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_BASE_URL ||
  window.location.origin.replace(/:\d+$/, ":8080");

// 🌐 소셜 로그인: 스프링 시큐리티 기본 엔드포인트로 리다이렉트
//   /oauth2/authorization/{registrationId}
const socialLogin = (provider) => {
  window.location.href = `${API_BASE}/oauth2/authorization/${provider}`;
};

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const canLogin = useMemo(
    () => email.trim() !== "" && password.trim() !== "",
    [email, password]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canLogin || loading) return;

    try {
      setLoading(true);
      // 1) 일반 로그인 (쿠키 기반: http.js에 withCredentials:true 이미 설정)
      await signIn({ email, password });

      // 2) (선택) 로그인 직후 내 정보 확인
      try {
        const { data } = await getMe();
        console.log("ME:", data);
      } catch (err) {
        console.warn("getMe failed (optional):", err?.response || err);
      }

      // 3) 상위 상태 갱신 + 메인 이동
      onLogin?.();
      navigate("/main");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        "로그인 실패(이메일/비밀번호 확인 또는 CORS)";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Bg>
      <Logo> TingTing </Logo>

      <Card as="form" onSubmit={handleSubmit}>
        <Brand>TingTing</Brand>
        <Title>로그인</Title>

        <Input
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />
        <Input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading}
        />

        <PrimaryBtn type="submit" disabled={!canLogin || loading}>
          {loading ? "로그인 중..." : "로그인"}
        </PrimaryBtn>

        <OutlineBtn type="button" onClick={() => navigate("/signup")} disabled={loading}>
          회원가입
        </OutlineBtn>

        <Row>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Checkbox type="checkbox" disabled={loading} /> 자동 로그인
          </label>
          <SmallLinks>
            <Link to="#" onClick={(e) => e.preventDefault()}>아이디 찾기</Link>
            <span> | </span>
            <Link to="#" onClick={(e) => e.preventDefault()}>비밀번호 찾기</Link>
          </SmallLinks>
        </Row>

        <Divider />

        {/* ✅ 구글/네이버 소셜 로그인 (리다이렉트 방식) */}
        <SocialBtn type="button" onClick={() => socialLogin("google")} disabled={loading}>
          <span style={{ fontWeight: 700 }}>G</span>&nbsp; Continue with Google
        </SocialBtn>
        <SocialBtn type="button" onClick={() => socialLogin("naver")} disabled={loading}>
          🟩&nbsp; Continue with Naver
        </SocialBtn>
      </Card>
    </Bg>
  );
};

export default Login;

/* ===== styles ===== */
const Bg = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #ffb7d5 0%, #ff9ec2 40%, #ffb5d1 100%);
  padding: 24px;
`;

const Logo = styled.h2`
  position: absolute; 
  top: 36px; 
  left: 0; 
  right: 0;
  text-align: center;
  color: #fff;
  font-size: clamp(24px, 3.8vw, 36px);
  text-shadow: 0 6px 16px rgba(0,0,0,.18), 0 2px 0 rgba(255,255,255,.35);
`;

const Card = styled.section`
  width: min(92vw, 420px);
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px;
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
  margin-top: 6px;
  &:hover { transform: ${({ disabled }) => (disabled ? "none" : "translateY(-1px)")}; }
`;

const OutlineBtn = styled.button`
  width: 100%;
  height: 46px;
  border-radius: 999px;
  border: 2px solid #ff2f79;
  color: #ff2f79;
  background: #fff;
  font-weight: 800;
  margin-top: 10px;
  cursor: pointer;
`;

const Row = styled.div`
  display: flex; 
  justify-content: 
  space-between; 
  align-items: center;
  font-size: 13px; 
  margin-top: 12px;
`;

const Checkbox = styled.input`
  width: 16px; 
  height: 16px;
`;

const SmallLinks = styled.div`
  display: flex; 
  align-items: center; 
  gap: 6px;
  a { font-weight: 700; color: #555; }
`;

const Divider = styled.div`
  height: 1px; 
  background: #eee; 
  margin: 16px 0 12px;
`;

const SocialBtn = styled.button`
  width: 100%;
  height: 44px;
  border-radius: 10px;
  border: 1.5px solid #e6e6e6;
  background: #fafafa;
  font-weight: 600;
  margin-top: 8px;
  cursor: pointer;
`;
