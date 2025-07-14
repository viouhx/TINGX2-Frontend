import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/navigation";
import { Testimonials } from "./components/testimonials";
import Login from "./components/login";          // ⬅️ 새로 만들 파일
import Signup from "./components/signup"; 
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import "./App.css";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);   // ⬅️ 로그인 상태
  const [messages, setMessages] = useState([]); // ✅ 전역 메시지 상태

  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  const handleLogin  = () => setIsLoggedIn(true);
  const handleLogout = () => {
    setIsLoggedIn(false);
    setMessages([]); // ✅ 로그아웃 시 메시지 초기화
  };
  return (
    <Router>
      <Navigation isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <Routes>
        <Route
          path="/"
          element={
            <Testimonials
              isLoggedIn={isLoggedIn}
              messages={messages}
              setMessages={setMessages}
            />
          }
        />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
};

export default App;
