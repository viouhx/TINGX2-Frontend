// src/components/navigation.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { getMe, signOut } from "../api/auth";

export const Navigation = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [me, setMe] = useState(null);

  const normalizeName = (d) =>
    d?.nickname ?? d?.nickName ?? d?.usNickname ?? null;

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await getMe();
      setMe(data);
    } catch {
      setMe(null);
    }
  }, []);

  // 1) 처음 마운트 + isLoggedIn 변경 + 경로 변경 때마다 다시 조회
  useEffect(() => {
    fetchMe();
  }, [fetchMe, isLoggedIn, location.pathname]);

  // 2) 로그인 직후 트리거(아래 B에서 이벤트 발생시킴)
  useEffect(() => {
    const handler = () => fetchMe();
    window.addEventListener("auth:changed", handler);
    return () => window.removeEventListener("auth:changed", handler);
  }, [fetchMe]);

  const doLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("signOut failed:", e?.response || e);
    } finally {
      setMe(null);
      onLogout?.();
      navigate("/login");
    }
  };

  const logged = !!me || isLoggedIn;
  const displayName = normalizeName(me) ? `${normalizeName(me)}님` : "사용자님";

  return (
    <TopBar>
      <Inner>
        <Brand to="/main">TINGTING</Brand>

        <Right>
          {!logged ? (
            <>
              <NavLink to="/login">로그인</NavLink>
              <Divider />
              <NavLink to="/signup">회원가입</NavLink>
            </>
          ) : (
            <>
              <Muted>{displayName}</Muted>
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