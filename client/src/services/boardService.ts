import api from './api';
import { generateBoardId } from '../utils/id';
import { getCurrentUser } from '../utils/auth';

export interface Board {
  id?: number;
  user_id?: number;
  title: string;
  description?: string;
  backdrop?: string;
  is_starred?: boolean;
  is_closed?: boolean;
  created_at?: string;
}

export const boardService = {
  async getAll() {
    const res = await api.get<Board[]>('/boards');
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return [];
    
    return res.data.filter(board => board.user_id === currentUser.id);
  },
  
  async getById(id: number) {
    const res = await api.get<Board>(`/boards/${id}`);
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return null;
    
    if (res.data.user_id !== currentUser.id) return null;
    return res.data;
  },
  
  async create(payload: Board) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) throw new Error('User not authenticated');
    const id = await generateBoardId();
    const res = await api.post<Board>('/boards', {
      ...payload,
      id,
      user_id: currentUser.id
    });
    return res.data;
  },
  
  async update(id: number, payload: Partial<Board>) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) throw new Error('User not authenticated');
    
    const board = await this.getById(id);
    if (!board) throw new Error('Board not found or access denied');
    
    const res = await api.patch<Board>(`/boards/${id}`, payload);
    return res.data;
  },
  
  async remove(id: number) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) throw new Error('User not authenticated');
    
    const board = await this.getById(id);
    if (!board) throw new Error('Board not found or access denied');
    
    await api.delete(`/boards/${id}`);
  }
};


