import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tagService, type Tag } from '../../services/tagService';

interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

const initialState: TagState = {
  tags: [],
  loading: false,
  error: null,
};

export const fetchTagsByTask = createAsyncThunk(
  'tags/fetchTagsByTask',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const tags = await tagService.getByTask(taskId);
      return tags;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch tags');
    }
  }
);

export const createTag = createAsyncThunk(
  'tags/createTag',
  async (tagData: { task_id: number; content: string; color: string }, { rejectWithValue }) => {
    try {
      const tag = await tagService.create(tagData);
      return tag;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create tag');
    }
  }
);

export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async ({ tagId, data }: { tagId: number; data: Partial<Tag> }, { rejectWithValue }) => {
    try {
      const tag = await tagService.update(tagId, data);
      return tag;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update tag');
    }
  }
);

export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (tagId: number, { rejectWithValue }) => {
    try {
      await tagService.remove(tagId);
      return tagId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete tag');
    }
  }
);

const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearTags: (state) => {
      state.tags = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTagsByTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTagsByTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTagsByTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags.push(action.payload);
      })
      .addCase(createTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tags.findIndex(tag => tag.id === action.payload.id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = state.tags.filter(tag => tag.id !== action.payload);
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTags, clearError } = tagSlice.actions;
export default tagSlice.reducer;
