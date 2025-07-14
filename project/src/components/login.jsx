import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";

const Login = ({ onLogin }) => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 실제 인증 로직
    onLogin();
    navigate("/");
  };

  return (
    <Wrapper>
      <LoginBox>
        <Link to="/" style={{ display: "block", textAlign: "center", marginTop: "20px" }}>
          <h2>CHATBOT</h2>
        </Link>

        <h1 style={{ textAlign: "center", marginTop: "10px" }} className="font30 extraBold">
          로그인
        </h1>

        <form onSubmit={handleSubmit}>
          <InputBox
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디"
          />
          <InputBox
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
          />

          <LoginButton style={{ marginTop: "20px" }} type="submit">
            로그인
          </LoginButton>
          <LoginButton
  type="button"
  onClick={() => navigate("/signup")}   // ⬅️ 준비 중 → 페이지 이동
>
  회원가입
</LoginButton>

          <LoginInfo>
            <Checkbox type="checkbox" />자동 로그인
            <span style={{ marginLeft: "80px" }}>
              <Link style={{ fontSize: "13px", fontWeight: "bold" }} to="#">
                아이디 찾기
              </Link>{" "}
              |{" "}
              <Link style={{ fontSize: "13px", fontWeight: "bold" }} to="#">
                비밀번호 찾기
              </Link>
            </span>
          </LoginInfo>
        </form>
      </LoginBox>
    </Wrapper>
  );
};

export default Login;

/* ───────────── styled-components ───────────── */
const Wrapper = styled.section`
  width: 100%;
  min-height: 100vh;
  background: #eff8f3;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const LoginBox = styled.div`
  width: 500px;
  background: #ffffff;
  padding: 40px 0;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
`;

const InputBox = styled.input`
  display: block;
  margin: 0 auto;
  width: 400px;
  height: 50px;
  border: 1.5px solid #ccc;
  padding-left: 10px;
  font-size: 16px;
  outline: none;

  &:focus {
    border: 2px solid #20c075;
  }

  transition: border 0.2s ease;

  &:first-of-type {
    margin-top: 30px;
  }

  &:last-of-type {
    margin-top: 0;
  }
`;

const Checkbox = styled.input`
  width: 11px;
  height: 11px;
  border: 2px solid #000000;
  margin-left: 0;
  margin-right: 5px;
`;

const LoginButton = styled.button`
  display: block;
  width: 400px;
  height: 50px;
  background-color: #20c075;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 18px;
  margin: 10px auto 0;
`;

const LoginInfo = styled.div`
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  margin-top: 15px;
`;
