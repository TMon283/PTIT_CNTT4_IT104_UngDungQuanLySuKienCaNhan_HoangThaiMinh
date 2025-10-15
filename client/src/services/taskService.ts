import api from './api';
import { getCurrentUser } from '../utils/auth';
import { generateTaskId } from '../utils/id';

export interface TaskItem {
  id?: number;
  list_id: number;
  user_id?: number;
  title: string;
  description?: string;
  status?: string;
  due_date?: string;
  created_at?: string;
}

export const taskService = {
  async getByList(listId: number) {
    const res = await api.get<TaskItem[]>('/tasks');
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return [];
    
    return res.data.filter(task => 
      task.list_id === listId && task.user_id === currentUser.id
    );
  },
  
  async getById(id: number) {
    const res = await api.get<TaskItem>(`/tasks/${id}`);
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return null;
    
    if (res.data.user_id !== currentUser.id) return null;
    return res.data;
  },
  
  async create(payload: TaskItem) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) throw new Error('User not authenticated');
    const id = await generateTaskId();
    const res = await api.post<TaskItem>('/tasks', {
      ...payload,
      id,
      user_id: currentUser.id
    });
    return res.data;
  },
  
  async update(id: number, payload: Partial<TaskItem>) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) throw new Error('User not authenticated');
    
    const task = await this.getById(id);
    if (!task) throw new Error('Task not found or access denied');
    
    const res = await api.patch<TaskItem>(`/tasks/${id}`, payload);
    return res.data;
  },
  
  async remove(id: number) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) throw new Error('User not authenticated');
    
    const task = await this.getById(id);
    if (!task) throw new Error('Task not found or access denied');
    
    await api.delete(`/tasks/${id}`);
  }
};


