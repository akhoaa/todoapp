import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { IUser, IAssignRoleRequest } from '@/types/backend';
import { callGetUsers, callAssignRole, callRemoveRole } from '@/config/api';
import { message } from 'antd';

interface UserState {
  users: IUser[];
  selectedUser: IUser | null;
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  filters: {
    search: string;
    role: string;
    status: string;
  };
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {
    search: '',
    role: '',
    status: '',
  },
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await callGetUsers();
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch users';
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const assignUserRole = createAsyncThunk(
  'users/assignRole',
  async ({ userId, roleData }: { userId: number; roleData: IAssignRoleRequest }, { rejectWithValue }) => {
    try {
      await callAssignRole(userId, roleData);
      message.success('Role assigned successfully');
      return { userId, roleId: roleData.roleId };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to assign role';
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const removeUserRole = createAsyncThunk(
  'users/removeRole',
  async ({ userId, roleId }: { userId: number; roleId: number }, { rejectWithValue }) => {
    try {
      await callRemoveRole(userId, roleId);
      message.success('Role removed successfully');
      return { userId, roleId };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to remove role';
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<IUser | null>) => {
      state.selectedUser = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<UserState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<UserState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUserState: (state) => {
      state.users = [];
      state.selectedUser = null;
      state.error = null;
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Assign role
      .addCase(assignUserRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignUserRole.fulfilled, (state, action) => {
        state.loading = false;
        // Update user in the list if needed
        const { userId } = action.payload;
        const userIndex = state.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          // Refresh users list to get updated role information
          // This will be handled by refetching users in the component
        }
      })
      .addCase(assignUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove role
      .addCase(removeUserRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeUserRole.fulfilled, (state, action) => {
        state.loading = false;
        // Update user in the list if needed
        const { userId } = action.payload;
        const userIndex = state.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          // Refresh users list to get updated role information
          // This will be handled by refetching users in the component
        }
      })
      .addCase(removeUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedUser,
  setFilters,
  setPagination,
  clearError,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;
