import api from './api';
import { getCurrentUser } from '../utils/auth';

export interface Tag {
  id?: number;
  task_id: number;
  user_id?: number;
  content: string;
  color: string;
}

export const tagService = {
  async getByTask(taskId: number) {
    const res = await api.get<Tag[]>('/tags');
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return [];
    
    return res.data.filter(tag => 
      tag.task_id === taskId && tag.user_id === currentUser.id
    );
  },
  
  async create(payload: Tag) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) throw new Error('User not authenticated');
    
    const res = await api.post<Tag>('/tags', {
      ...payload,
      user_id: currentUser.id
    });
    return res.data;
  },
  
  async update(id: number, payload: Partial<Tag>) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) throw new Error('User not authenticated');
    
    const tag = await this.getById(id);
    if (!tag) throw new Error('Tag not found or access denied');
    
    const res = await api.patch<Tag>(`/tags/${id}`, payload);
    return res.data;
  },
  
  async remove(id: number) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) throw new Error('User not authenticated');
    
    const tag = await this.getById(id);
    if (!tag) throw new Error('Tag not found or access denied');
    
    await api.delete(`/tags/${id}`);
  },
  
  async getById(id: number) {
    const res = await api.get<Tag>(`/tags/${id}`);
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return null;
    
    if (res.data.user_id !== currentUser.id) return null;
    return res.data;
  }
};
