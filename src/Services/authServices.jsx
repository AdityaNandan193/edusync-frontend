import axios from "axios";

const API_URL = "https://localhost:7136/api";

export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
};

export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email) => {
  return axios.post(`${API_URL}/auth/forget-password`, { email });
};

export const resetPassword = async (email, token, newPassword) => {
  return axios.post(`${API_URL}/Auth/reset-password`, {
    email,
    token,
    newPassword,
  });
};