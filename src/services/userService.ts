/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from "../types/UserTypes";
import { authApi } from "../utils/AxiosInterceptor";

const userService = {
  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<User>} - User object
   */
  async getUser(id: string): Promise<User> {
    try {
      const res = await authApi.get(`/users/${id}`);
      console.log(">>> check res getUser: ", res);
      const userData = res.data;
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || "user",
      };
      return user;
    } catch (error) {
      throw new Error("Failed to get user");
    }
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {string} name - Name
   * @param {string} email -Email
   * @param {"user" | "admin"} role - Role
   * @returns {Promise<User>} - User object
   */
  async updateUser(
    id: string,
    name: string,
    email: string,
    role: "user" | "admin"
  ): Promise<User> {
    try {
      const reqData = {
        name: name,
        email,
        role,
      };
      const res = await authApi.put(`/users/${id}`, reqData);
      console.log(">>> check res updateUser: ", res);
      const userData = res.data;
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || "user",
      };
      return user;
    } catch (error) {
      throw new Error("Failed to update user");
    }
  },

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<void>} - Promise object
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await authApi.delete(`/users/${id}`);
    } catch (error) {
      throw new Error("Failed to delete user");
    }
  },

  /**
   * list all users
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @param {string} role - Filter users by role
   * @param {string} search - Search users by name or email
   * @param {string} sort - Sort field and direction
   * @returns {Promise<any>} - List of users
   */
  async listUsers(
    page: number,
    size: number,
    role: string,
    search: string,
    sort: string
  ): Promise<any> {
    try {
      const res = await authApi.get(
        `/users?page=${page}&size=${size}&role=${role}&search=${search}&sort=${sort}`
      );
      console.log(">>> check res listUsers: ", res);
      // const usersData = res.data.data;
      // const users: User[] = usersData.map((userData: any) => ({
      //   id: userData.id,
      //   name: userData.name,
      //   email: userData.email,
      //   role: userData.role || "user",
      // }));
      // const total_page = res.data.meta.total_page;
      // const total_user = res.data.meta.total_user;
      // return { users, total_page, total_user };
      return res.data;
    } catch (error) {
      throw new Error("Failed to list users");
    }
  },

  /**
   * Create user
   * @param {string} name - Name
   * @param {string} email - Email
   * @param {string} password - Password
   * @param {"user" | "admin"} role - Role
   * @returns {Promise<User>} - User object
   */
  async createUser(
    name: string,
    email: string,
    password: string,
    role: "user" | "admin"
  ): Promise<User> {
    try {
      const reqData = {
        name: name,
        email,
        password,
        role,
      };
      const res = await authApi.post(`/users/`, reqData);
      console.log(">>> check res createUser: ", res);
      const userData = res.data;
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || "user",
      };
      return user;
    } catch (error) {
      throw new Error("Failed to create user");
    }
  },

  /**
   * Change password
   * @param id - User ID
   * @param passwordData - Current password and new password
   * @returns {Promise<void>} - Promise object
   */
  async changePassword(
    id: string,
    passwordData: {
      currentPassword: string;
      newPassword: string;
    }
  ): Promise<void> {
    try {
      await authApi.post(`/users/${id}/change-password`, passwordData);
    } catch (error) {
      throw new Error("Failed to change password");
    }
  },
};

export default userService;
