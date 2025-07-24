import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchAccount } from '@/config/api';
import type { IUser } from '@/types/backend';

interface IState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshToken: boolean;
  errorRefreshToken: string;
  user: IUser | null;
}

const initialState: IState = {
  isAuthenticated: false,
  isLoading: true,
  isRefreshToken: false,
  errorRefreshToken: "",
  user: null,
};

export const fetchAccount = createAsyncThunk(
  'account/fetchAccount',
  async () => {
    const response = await callFetchAccount();
    return response;
  }
);

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setUserLoginInfo: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload;
    },
    setLogoutAction: (state) => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      state.isAuthenticated = false;
      state.user = null;
      state.isLoading = false;
    },
    setRefreshTokenAction: (state, action) => {
      state.isRefreshToken = action.payload?.status ?? false;
      state.errorRefreshToken = action.payload?.message ?? "";
    },
    setLoadingFalse: (state) => {
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccount.pending, (state) => {
        if (state.isRefreshToken === true) {
          state.isLoading = false;
        } else {
          state.isLoading = true;
        }
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.data && action.payload.data.user) {
          state.isAuthenticated = true;
          state.user = action.payload.data.user;
        }
      })
      .addCase(fetchAccount.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const {
  setUserLoginInfo,
  setLogoutAction,
  setRefreshTokenAction,
  setLoadingFalse
} = accountSlice.actions;

export default accountSlice.reducer;
