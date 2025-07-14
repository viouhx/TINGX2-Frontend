import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

export const Testimonials = ({ isLoggedIn }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  const handleSend = () => {
    if (!isLoggedIn) {
      navigate("/login"); // 로그인 안 돼 있으면 로그인 페이지로
      return;
    }

    if (inputValue.trim() === "") return;

    setMessages([...messages, { text: inputValue, sender: "user" }]);
    setInputValue("");

    setTimeout(() => {
      setMessages((prev) => [...prev, { text: "답변입니다!", sender: "bot" }]);
    }, 600);
  };

  return (
    <Container>
      <ChatBox>
        <ChatHeader>CHATBOT</ChatHeader>

        <ChatArea>
          {messages.map((msg, idx) => (
            <MessageWrapper key={idx} isUser={msg.sender === "user"}>
              <Message isUser={msg.sender === "user"}>{msg.text}</Message>
            </MessageWrapper>
          ))}

          {!isLoggedIn && (
            <LoginNotice>
              ※ 로그인 후 채팅을 이용하실 수 있습니다.
            </LoginNotice>
          )}
        </ChatArea>

        <InputBox>
          <Input
            type="text"
            value={inputValue}
            placeholder="메시지를 입력하세요"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={!isLoggedIn}
          />
          <SendButton onClick={handleSend} disabled={!isLoggedIn}>
            전송
          </SendButton>
        </InputBox>
      </ChatBox>
    </Container>
  );
};

/* ───────── styled-components ───────── */
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 120px;
  min-height: 100vh;
  background: #f5fbef;
`;

const ChatBox = styled.div`
  background: #ffffff;
  border: 2px solid #0ab867;
  border-radius: 20px;
  width: 2000px;
  height: 800px;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const ChatHeader = styled.h2`
  text-align: center;
  color: #0ab867;
  margin-bottom: 10px;
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #e8fbe8;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  position: relative;
`;

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${({ isUser }) => (isUser ? "flex-end" : "flex-start")};
  margin-bottom: 10px;
`;

const Message = styled.div`
  background: ${({ isUser }) => (isUser ? "#d2f8d2" : "#ffffff")};
  color: black;
  padding: 10px 15px;
  font-size: 16px;
  border-radius: ${({ isUser }) =>
    isUser ? "20px 20px 0 20px" : "20px 20px 20px 0"};
  max-width: 80%;
  line-height: 1.5;
  word-break: break-word;
`;

const InputBox = styled.div`
  display: flex;
`;

const Input = styled.input`
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
  font-size: 16px;
  background-color: ${({ disabled }) => (disabled ? "#f0f0f0" : "white")};
`;

const SendButton = styled.button`
  margin-left: 10px;
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#0ab867")};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0 20px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

const LoginNotice = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: red;
  font-weight: bold;
`;
