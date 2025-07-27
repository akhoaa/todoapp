import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callGetTasks, callCreateTask, callUpdateTask, callDeleteTask } from '@/config/api';
import type { ITask, ICreateTask, IUpdateTask } from '@/types/backend';

interface IState {
  tasks: ITask[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

const initialState: IState = {
  tasks: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (status?: string) => {
    const response = await callGetTasks(status);
    // Extract only serializable data from the Axios response
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText
    };
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (data: ICreateTask) => {
    const response = await callCreateTask(data);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ id, data }: { id: number; data: IUpdateTask }) => {
    const response = await callUpdateTask(id, data);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (id: number) => {
    await callDeleteTask(id);
    return id;
  }
);

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    addTaskToList: (state, action) => {
      state.tasks.unshift(action.payload);
    },
    updateTaskInList: (state, action) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTaskFromList: (state, action) => {
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
      })

      // Create task
      .addCase(createTask.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isCreating = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.error.message || 'Failed to create task';
      })

      // Update task
      .addCase(updateTask.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to update task';
      })

      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.error.message || 'Failed to delete task';
      });
  },
});

export const {
  addTaskToList,
  updateTaskInList,
  removeTaskFromList,
  clearTasks
} = taskSlice.actions;

export default taskSlice.reducer;
