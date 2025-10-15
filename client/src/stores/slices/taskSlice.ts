import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { taskService, type TaskItem } from '../../services/taskService';

interface TaskState {
  tasks: TaskItem[];
  currentTask: TaskItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
};

export const fetchTasksByList = createAsyncThunk(
  'tasks/fetchTasksByList',
  async (listId: number, { rejectWithValue }) => {
    try {
      const tasks = await taskService.getByList(listId);
      return tasks;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const task = await taskService.getById(taskId);
      return task;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: { list_id: number; title: string; description?: string; due_date?: string }, { rejectWithValue }) => {
    try {
      const task = await taskService.create(taskData);
      return task;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, data }: { taskId: number; data: Partial<TaskItem> }, { rejectWithValue }) => {
    try {
      const task = await taskService.update(taskId, data);
      return task;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: number, { rejectWithValue }) => {
    try {
      await taskService.remove(taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete task');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setCurrentTask: (state, action: PayloadAction<TaskItem | null>) => {
      state.currentTask = action.payload;
    },
    clearTasks: (state) => {
      state.tasks = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksByList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByList.fulfilled, (state, action) => {
        state.loading = false;
        const newTasks = action.payload;
        const existingTasks = state.tasks.filter(task => 
          !newTasks.some((newTask: any) => newTask.list_id === task.list_id)
        );
        state.tasks = [...existingTasks, ...newTasks];
      })
      .addCase(fetchTasksByList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentTask, clearTasks, clearError } = taskSlice.actions;
export default taskSlice.reducer;
