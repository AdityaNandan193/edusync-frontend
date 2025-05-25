import axios from "axios";
import { API_URL } from '../config';

export const loginUser = async (email, password) => {
  try {
    console.log('Attempting login with:', { email });
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    console.log('Login response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
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