import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listService, type ListItem } from '../../services/listService';

interface ListState {
  lists: ListItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ListState = {
  lists: [],
  loading: false,
  error: null,
};

export const fetchListsByBoard = createAsyncThunk(
  'lists/fetchListsByBoard',
  async (boardId: number, { rejectWithValue }) => {
    try {
      const lists = await listService.getByBoard(boardId);
      return lists;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch lists');
    }
  }
);

export const createList = createAsyncThunk(
  'lists/createList',
  async (listData: { board_id: number; title: string }, { rejectWithValue }) => {
    try {
      const list = await listService.create(listData);
      return list;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create list');
    }
  }
);

export const updateList = createAsyncThunk(
  'lists/updateList',
  async ({ listId, data }: { listId: number; data: Partial<ListItem> }, { rejectWithValue }) => {
    try {
      const list = await listService.update(listId, data);
      return list;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update list');
    }
  }
);

export const deleteList = createAsyncThunk(
  'lists/deleteList',
  async (listId: number, { rejectWithValue }) => {
    try {
      await listService.remove(listId);
      return listId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete list');
    }
  }
);

const listSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    clearLists: (state) => {
      state.lists = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListsByBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListsByBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload;
      })
      .addCase(fetchListsByBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.loading = false;
        state.lists.push(action.payload);
      })
      .addCase(createList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateList.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.lists.findIndex(list => list.id === action.payload.id);
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
      })
      .addCase(updateList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = state.lists.filter(list => list.id !== action.payload);
      })
      .addCase(deleteList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLists, clearError } = listSlice.actions;
export default listSlice.reducer;
