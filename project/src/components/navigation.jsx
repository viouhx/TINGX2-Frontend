// src/components/navigation.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { signOut } from "../api/auth";

export const Navigation = ({ isLoggedIn, onLogout, userName = "사용자님" }) => {
  const navigate = useNavigate();

  const doLogout = async () => {
    try {
      // 서버 세션/쿠키 정리
      await signOut();
    } catch (e) {
      console.error("signOut failed:", e?.response || e);
      // 서버 에러가 나도 클라이언트 상태는 정리해 사용자 경험 보장
    } finally {
      onLogout?.();       // App 상태 초기화 (isLoggedIn=false 등)
      navigate("/login"); // 로그인 페이지로
    }
  };

  return (
    <TopBar>
      <Inner>
        <Brand to="/main">TINGTING</Brand>

        <Right>
          {!isLoggedIn ? (
            <>
              <NavLink to="/login">로그인</NavLink>
              <Divider />
              <NavLink to="/signup">회원가입</NavLink>
            </>
          ) : (
            <>
              <Muted>{userName}</Muted>
              <Divider />
              <Icon aria-hidden>👤</Icon>
              <NavLink to="/mypage">마이페이지</NavLink>
              <Divider />
              <Icon aria-hidden>↪</Icon>
              <TextButton onClick={doLogout}>로그아웃</TextButton>
            </>
          )}
        </Right>
      </Inner>
    </TopBar>
  );
};

/* ===== styles ===== */
const TopBar = styled.header`
  position: fixed;
  inset: 0 0 auto 0;
  height: 52px;
  z-index: 1000;
  background: linear-gradient(90deg, #ffd6ea 0%, #ffc8e0 50%, #ffbfd9 100%);
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
`;

const Inner = styled.div`
  max-width: 1280px;
  height: 52px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Brand = styled(Link)`
  color: #fff;
  font-weight: 900;
  letter-spacing: 1px;
  text-decoration: none;
  font-size: 20px;
  text-shadow: 0 2px 8px rgba(0,0,0,.12);
  &:hover { opacity: .95; }
`;

const Right = styled.nav`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
`;

const NavLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  padding: 6px 8px;
  border-radius: 8px;
  transition: background .15s ease, opacity .15s ease;
  &:hover { background: rgba(255,255,255,.14); }
`;

const TextButton = styled.button`
  color: #fff;
  font-weight: 700;
  padding: 6px 8px;
  border: 0;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background .15s ease;
  &:hover { background: rgba(255,255,255,.14); }
`;

const Divider = styled.span`
  display: inline-block;
  width: 1px;
  height: 16px;
  background: rgba(255,255,255,.5);
  margin: 0 2px;
`;

const Muted = styled.span`
  opacity: .9;
  font-weight: 600;
`;

const Icon = styled.span`
  opacity: .9;
  font-size: 14px;
`;
