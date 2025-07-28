import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callGetTasks, callGetTaskById, callCreateTask, callUpdateTask, callDeleteTask } from '@/config/api';
import type { ITask, ICreateTask, IUpdateTask } from '@/types/backend';

interface IState {
  tasks: ITask[];
  currentTask: ITask | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  filters: {
    status: string;
    search: string;
    projectId?: number;
  };
}

const initialState: IState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  filters: {
    status: '',
    search: '',
    projectId: undefined,
  },
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

export const fetchTaskById = createAsyncThunk(
  'task/fetchTaskById',
  async (id: number) => {
    const response = await callGetTaskById(id);
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
      if (state.currentTask?.id === action.payload.id) {
        state.currentTask = action.payload;
      }
    },
    removeTaskFromList: (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      if (state.currentTask?.id === action.payload) {
        state.currentTask = null;
      }
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.currentTask = null;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
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

      // Fetch task by ID
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch task';
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
  clearTasks,
  setCurrentTask,
  setFilters,
  clearError
} = taskSlice.actions;

export default taskSlice.reducer;
