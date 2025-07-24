import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './slice/accountSlice';
import taskReducer from './slice/taskSlice';

export const store = configureStore({
  reducer: {
    account: accountReducer,
    task: taskReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
