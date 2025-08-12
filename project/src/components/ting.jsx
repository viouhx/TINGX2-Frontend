// src/components/ting.jsx
import React from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

export default function Ting() {
  const navigate = useNavigate();

  return (
    <Landing>
      <Inner>
        <Title>TingTing</Title>
        <Subtitle>AI로 만나는 소개팅 시뮬레이션 서비스</Subtitle>
        <StartButton
          type="button"
          onClick={() => navigate("/login")}
          aria-label="로그인 화면으로 이동"
        >
          START
        </StartButton>
      </Inner>
    </Landing>
  );
}

/* ======= styles ======= */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Landing = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #ffb7d5 0%, #ff9ec2 40%, #ffb5d1 100%);
`;

const Inner = styled.div`
  text-align: center;
  animation: ${fadeIn} 480ms ease-out;
`;

const Title = styled.h1`
  margin: 0 0 14px;
  font-size: clamp(48px, 9vw, 120px);
  font-weight: 800;
  letter-spacing: 1px;
  color: #ffffff;
  text-shadow: 0 6px 16px rgba(0, 0, 0, 0.18), 0 2px 0 rgba(255, 255, 255, 0.35);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12));
`;

const Subtitle = styled.p`
  margin: 0 0 28px;
  font-size: clamp(14px, 2.4vw, 20px);
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
`;

const StartButton = styled.button`
  padding: 14px 36px;
  border: 0;
  border-radius: 999px;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(180deg, #ff3f8a 0%, #ff2f79 100%);
  box-shadow: 0 8px 20px rgba(255, 47, 121, 0.45), inset 0 -2px 0 rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
  &:hover { transform: translateY(-1px); filter: brightness(1.02); }
  &:active { transform: translateY(1px); box-shadow: 0 4px 10px rgba(255, 47, 121, 0.35) inset; }
  outline: none;
`;
