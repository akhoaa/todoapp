import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callGetTasks } from '@/config/api';
import type { ITask } from '@/types/backend';

interface IState {
  tasks: ITask[];
  isLoading: boolean;
  error: string | null;
}

const initialState: IState = {
  tasks: [],
  isLoading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (status?: string) => {
    const response = await callGetTasks(status);
    return response;
  }
);

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    clearTasks: (state) => {
      state.tasks = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.data && Array.isArray(action.payload.data)) {
          state.tasks = action.payload.data;
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      });
  },
});

export const {
  addTask,
  updateTask,
  removeTask,
  clearTasks
} = taskSlice.actions;

export default taskSlice.reducer;
