import api from './api';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
}

export const userService = {
  register: async (payload: RegisterPayload) => {
    const res = await api.post('/users', payload);
    return res.data as User;
  },
  login: async (email: string, password: string) => {
    const res = await api.get<User[]>('/users');
    const user = res.data.find(u => u.email === email && u.password === password);
    return user ?? null;
  },
  checkEmailExists: async (email: string) => {
    const res = await api.get<User[]>('/users');
    return res.data.some(u => u.email === email);
  }
};
