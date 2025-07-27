import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './slice/accountSlice';
import taskReducer from './slice/taskSlice';
import projectReducer from './slice/projectSlice';

export const store = configureStore({
  reducer: {
    account: accountReducer,
    task: taskReducer,
    project: projectReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Make store available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).store = store;
}
