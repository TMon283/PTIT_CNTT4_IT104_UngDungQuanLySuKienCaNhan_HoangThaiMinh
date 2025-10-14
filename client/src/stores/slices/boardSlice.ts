import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { boardService, type Board } from '../../services/boardService';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

export const fetchUserBoards = createAsyncThunk(
  'boards/fetchUserBoards',
  async (_, { rejectWithValue }) => {
    try {
      const boards = await boardService.getAll();
      return boards;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch boards');
    }
  }
);

export const fetchBoardById = createAsyncThunk(
  'boards/fetchBoardById',
  async (boardId: number, { rejectWithValue }) => {
    try {
      const board = await boardService.getById(boardId);
      return board;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch board');
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (boardData: { title: string; description?: string; backdrop?: string }, { rejectWithValue }) => {
    try {
      const board = await boardService.create(boardData);
      return board;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create board');
    }
  }
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ boardId, data }: { boardId: number; data: Partial<Board> }, { rejectWithValue }) => {
    try {
      const board = await boardService.update(boardId, data);
      return board;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update board');
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (boardId: number, { rejectWithValue }) => {
    try {
      await boardService.remove(boardId);
      return boardId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete board');
    }
  }
);

const boardSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setCurrentBoard: (state, action: PayloadAction<Board | null>) => {
      state.currentBoard = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchUserBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBoardById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload;
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards.push(action.payload);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.boards.findIndex(board => board.id === action.payload.id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard?.id === action.payload.id) {
          state.currentBoard = action.payload;
        }
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = state.boards.filter(board => board.id !== action.payload);
        if (state.currentBoard?.id === action.payload) {
          state.currentBoard = null;
        }
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentBoard, clearError } = boardSlice.actions;
export default boardSlice.reducer;
