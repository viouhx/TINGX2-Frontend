// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Navigation } from "./components/navigation";
import { Testimonials } from "./components/testimonials";
import Ting from "./components/ting";     // ✅ 첫 화면
import Login from "./components/login";
import Signup from "./components/signup";
import Main from "./components/main";
import Analysis from "./components/analysis";
import MyPage from "./components/mypage";
import RecentChats from "./components/recent-chats";
import SmoothScroll from "smooth-scroll";
import "./App.css";

// 앵커 스크롤 부드럽게 (필요없으면 삭제해도 됨)
export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

function AppInner() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const location = useLocation();

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    setIsLoggedIn(false);
    setMessages([]); // 로그아웃 시 메시지 초기화
  };

  // ✅ 랜딩/로그인/회원가입에서는 상단 네비게이션 숨김
  const showNav = !["/", "/login", "/signup"].includes(location.pathname);

  return (
    <>
      {showNav && <Navigation isLoggedIn={isLoggedIn} onLogout={handleLogout} />}

      <Routes>
        {/* ✅ 첫 화면: Ting */}
        <Route path="/" element={<Ting />} />

        {/* 로그인/회원가입 */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />

        {/* 메인/채팅 화면 */}
        <Route path="/main" element={<Main />} />   {/* ✅ 추가 */}
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/history" element={<RecentChats />} />
        <Route
          path="/chat"
          element={
            <Testimonials
              isLoggedIn={isLoggedIn}
              messages={messages}
              setMessages={setMessages}
            />
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}
