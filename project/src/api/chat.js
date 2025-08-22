// src/api/chat.js
import http from "../lib/http";

/** 조건 생성: POST /api/chat/conditions
 *  DTO: { aiName, aiGender, aiAge, aiJob, aiChatStyle, aiPersonality, aiInterests }
 */
export const createConditions = ({
  name,
  gender,
  age,
  job,
  talkStyles = [],
  traits = [],
  hobbies = [],
}) => {
  const dto = {
    aiName: name,
    aiGender: gender,                 // "male"/"female" 그대로
    aiAge: String(age ?? ""),         // ★ 문자열 변환
    aiJob: job,
    aiChatStyle: talkStyles.join(","),// 콤마 구분
    aiPersonality: traits.join(","),  // 콤마 구분
    aiInterests: hobbies.join(","),   // 콤마 구분
  };
  return http.post(`/api/chat/conditions`, dto);
};

/** 채팅 시작: POST /api/chat/start (body: { conditionId })
 *  Res: { sessionId, aiMessage }
 */
export const startChat = ({ conditionId }) =>
  http.post(`/api/chat/start`, { conditionId });

/** (선택) 목록/로그 */
export const getChatSessions = () => http.get(`/api/chat/sessions`);
export const getChatLogs = (sessionId) =>
  http.get(`/api/chat/sessions/${sessionId}/logs`);

/** 분석 요청: POST /api/chat/analysis (body: { sessionId }) */
export const requestAnalysis = (sessionId) =>
  http.post(`/api/chat/analysis`, { sessionId }, { timeout: 0 });

// ✅ 분석 결과 조회(백엔드 어느 쪽이든 받게 두 가지 경로 시도)
export const fetchAnalysis = async (sessionId) => {
  try {
    // 1안: /api/chat/analysis?sessionId=...
    return await http.get(`/api/chat/analysis`, { params: { sessionId } });
  } catch (e1) {
    // 2안: /api/chat/sessions/{id}/analysis
    return await http.get(`/api/chat/sessions/${sessionId}/analysis`);
  }
};