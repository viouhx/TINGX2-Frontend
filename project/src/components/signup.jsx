import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

const Signup = () => {
  /* 단순 UI용 상태 */
  const [form, setForm] = useState({
    id: "", pw: "", pw2: "", name: "", email: "", phone: "",
  });
  const navigate = useNavigate();

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 실제 회원가입 로직
    alert("회원가입 완료!");
    navigate("/login");
  };

  const { id, pw, pw2, name, email, phone } = form;

  return (
    <Wrapper>
      <Box>
        <Link to="/" style={{ display: "block", textAlign: "center", marginTop: 20 }}>
          <h2>CHATBOT</h2>
        </Link>

        <h1 style={{ textAlign: "center", margin: "10px 0 30px" }}>회원가입</h1>

        <form onSubmit={handleSubmit}>
          <Input
            placeholder="아이디"
            name="id"
            value={id}
            onChange={onChange}
          />
          <Input
            type="password"
            placeholder="비밀번호"
            name="pw"
            value={pw}
            onChange={onChange}
          />
          <Input
            type="password"
            placeholder="비밀번호 확인"
            name="pw2"
            value={pw2}
            onChange={onChange}
          />
          <Input
            placeholder="이름"
            name="name"
            value={name}
            onChange={onChange}
          />
          <Input
            placeholder="이메일"
            name="email"
            value={email}
            onChange={onChange}
          />
          <Input
            placeholder="휴대폰 번호"
            name="phone"
            value={phone}
            onChange={onChange}
          />

          <SignButton type="submit" disabled={!id || !pw || pw !== pw2}>
            가입하기
          </SignButton>
        </form>
      </Box>
    </Wrapper>
  );
};

export default Signup;

/* ───────── styled-components ───────── */
const Wrapper = styled.section`
  width: 100%;
  min-height: 100vh;
  background: #eff8f3;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Box = styled.div`
  width: 500px;
  background: #ffffff;
  padding: 40px 0 60px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0,0,0,0.05);
`;

const Input = styled.input`
  display: block;
  width: 400px;
  height: 50px;
  margin: 0 auto 15px;
  border: 1.5px solid #ccc;
  border-radius: 5px;
  padding: 0 10px;
  font-size: 16px;
  outline: none;
  transition: border 0.2s;

  &:focus { border: 2px solid #20c075; }
`;

const SignButton = styled.button`
  display: block;
  width: 400px;
  height: 50px;
  margin: 10px auto 0;
  background: ${({ disabled }) => (disabled ? "#b2d9c7" : "#20c075")};
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;
