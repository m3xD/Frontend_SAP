/* eslint-disable @typescript-eslint/no-unused-vars */
import { authApi } from "./../utils/AxiosInterceptor";
import axios from "axios";
import { User } from "../types/UserTypes";

const API_URL = "https://api-sap.m3xd.dev/users";

const authService = {
  /**
   * Authenticates a user and returns tokens
   * @param {string} email - Email
   * @param {string} password - Password
   * @returns {Promise<{token: string, refreshToken: string, user: User}>} - Returns the token, refresh token, and user
   */
  async signin(
    email: string,
    password: string
  ): Promise<{ token: string; refreshToken: string; user: User }> {
    try {
      const reqData = {
        email,
        password,
      };
      const res = await axios.post(`${API_URL}/auth/login`, reqData);
      console.log(">>> check res signin: ", res);
      const token = res.data.token;
      const refreshToken = res.data.refreshToken;
      const userData = res.data.user;
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || "user",
      };
      return { token, refreshToken, user };
    } catch (error) {
      throw new Error("Login failed");
    }
  },

  /**
   * Registers a new user
   * @param {string} name - Name 
   * @param {string} email - Email 
   * @param {string} password - Password
   * @returns {Promise<void>} - Sign up response
   */
  async signup(name: string, email: string, password: string): Promise<void> {
    const reqData = {
      name: name,
      email,
      password,
    };
    console.log(">>> check reqData signup: ", reqData);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, reqData);
      console.log(">>> check res signup: ", res);
    } catch (error) {
      throw new Error("Failed to register");
    }
  },

  /**
   * Obtains a new access token using a refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{token: string, newRefreshToken: string}>} - Returns the new token and refresh token
   */
  async refreshToken(
    refreshToken: string
  ): Promise<{ token: string; newRefreshToken: string }> {
    try {
      const reqData = {
        refreshToken: refreshToken,
      };
      const res = await axios.post(`${API_URL}/auth/refresh`, reqData);
      console.log(">>> check res refreshToken: ", res);
      return { token: res.data.token, newRefreshToken: res.data.refreshToken };
    } catch (error) {
      throw new Error("Failed to refresh token");
    }
  },

  /**
   * Invalidates the refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<any>} - Returns the response
   */
  async logout(refreshToken: string): Promise<any> {
    try {
      const res = await authApi.post("/auth/logout", {refreshToken});
      return res;
    } catch (error) {
      throw new Error("Failed to logout");
    }
  },
};

export default authService;
