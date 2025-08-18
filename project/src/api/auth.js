// src/api/auth.js
import http from "../lib/http";

export const requestEmailVerification = (email) =>
  http.post(`/api/auth/verification/email`, null, { params: { email } });

export const confirmEmailVerification = ({ email, code }) =>
  http.post(`/api/auth/verification/confirm`, null, { params: { email, code } });

// ✅ signup 경로 정확히 '/signup'
export const signUp = (payload) => http.post(`/api/auth/signup`, payload);

export const signIn = ({ email, password }) =>
  http.post(`/api/auth/login`, { email, password });

export const signOut = () => http.post(`/api/auth/logout`);

// ✅ 프로필 계열은 /api/users/*
export const getMe = () => http.get(`/api/users/me`);
export const updateNickname = (nickname) =>
  http.put(`/api/users/me/nickname`, { nickname });
export const changePassword = ({ oldPassword, newPassword }) =>
  http.put(`/api/users/me/password`, { oldPassword, newPassword });

//세션/로그는 백엔드에서 /api/chat/.. 로 구현
export const getChatSessions = () => http.get(`/api/chat/sessions`);
export const getChatLogs = (sessionId) =>
  http.get(`/api/chat/sessions/${sessionId}/logs`);
