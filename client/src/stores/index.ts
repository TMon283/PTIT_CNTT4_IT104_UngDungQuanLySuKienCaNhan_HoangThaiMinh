import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import boardSlice from './slices/boardSlice';
import listSlice from './slices/listSlice';
import taskSlice from './slices/taskSlice';
import tagSlice from './slices/tagSlice';

const rootReducer = combineReducers({
  user: userSlice,
  boards: boardSlice,
  lists: listSlice,
  tasks: taskSlice,
  tags: tagSlice,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
