import api from './api';
import { getCurrentUser } from '../utils/auth';

export interface ListItem {
  id?: number;
  board_id: number;
  user_id?: number;
  title: string;
  created_at?: string;
}

export const listService = {
  async getByBoard(boardId: number) {
    const res = await api.get<ListItem[]>('/lists');
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return [];
    
    return res.data.filter(list => 
      list.board_id === boardId && list.user_id === currentUser.id
    );
  },
  
  async create(payload: ListItem) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) throw new Error('User not authenticated');
    
    const res = await api.post<ListItem>('/lists', {
      ...payload,
      user_id: currentUser.id
    });
    return res.data;
  },
  
  async update(id: number, payload: Partial<ListItem>) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) throw new Error('User not authenticated');
    
    const list = await this.getById(id);
    if (!list) throw new Error('List not found or access denied');
    
    const res = await api.patch<ListItem>(`/lists/${id}`, payload);
    return res.data;
  },
  
  async remove(id: number) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) throw new Error('User not authenticated');
    
    const list = await this.getById(id);
    if (!list) throw new Error('List not found or access denied');
    
    await api.delete(`/lists/${id}`);
  },
  
  async getById(id: number) {
    const res = await api.get<ListItem>(`/lists/${id}`);
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return null;
    
    if (res.data.user_id !== currentUser.id) return null;
    return res.data;
  }
};


