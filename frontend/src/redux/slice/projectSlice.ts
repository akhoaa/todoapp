import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  callGetProjects,
  callGetProjectById,
  callCreateProject,
  callUpdateProject,
  callDeleteProject,
  callGetProjectMembers,
  callAddProjectMember,
  callRemoveProjectMember,
  callGetUsers
} from '@/config/api';
import type { IProject, ICreateProject, IUpdateProject, IProjectMember, IAddProjectMember, IUser } from '@/types/backend';

interface IState {
  projects: IProject[];
  currentProject: IProject | null;
  projectMembers: IProjectMember[];
  availableUsers: IUser[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoadingUsers: boolean;
  error: string | null;
}

const initialState: IState = {
  projects: [],
  currentProject: null,
  projectMembers: [],
  availableUsers: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isLoadingUsers: false,
  error: null,
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async () => {
    const response = await callGetProjects();
    return response.data;
  }
);

export const fetchProjectById = createAsyncThunk(
  'project/fetchProjectById',
  async (id: number) => {
    const response = await callGetProjectById(id);
    return response.data;
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async (data: ICreateProject) => {
    const response = await callCreateProject(data);
    return response.data;
  }
);

export const updateProject = createAsyncThunk(
  'project/updateProject',
  async ({ id, data }: { id: number; data: IUpdateProject }) => {
    const response = await callUpdateProject(id, data);
    return response.data;
  }
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (id: number) => {
    await callDeleteProject(id);
    return id;
  }
);

export const fetchProjectMembers = createAsyncThunk(
  'project/fetchProjectMembers',
  async (projectId: number) => {
    const response = await callGetProjectMembers(projectId);
    return response.data;
  }
);

export const addProjectMember = createAsyncThunk(
  'project/addProjectMember',
  async ({ projectId, data }: { projectId: number; data: IAddProjectMember }) => {
    const response = await callAddProjectMember(projectId, data);
    return response.data.data?.member || response.data;
  }
);

export const removeProjectMember = createAsyncThunk(
  'project/removeProjectMember',
  async ({ projectId, memberId }: { projectId: number; memberId: number }) => {
    await callRemoveProjectMember(projectId, memberId);
    return memberId;
  }
);

export const fetchUsers = createAsyncThunk(
  'project/fetchUsers',
  async () => {
    const response = await callGetUsers();
    return response.data;
  }
);

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })

      // Fetch project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch project';
      })

      // Create project
      .addCase(createProject.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isCreating = false;
        state.projects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.error.message || 'Failed to create project';
      })

      // Update project
      .addCase(updateProject.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to update project';
      })

      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.projects = state.projects.filter(p => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.error.message || 'Failed to delete project';
      })

      // Fetch project members
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.projectMembers = action.payload;
      })

      // Add project member
      .addCase(addProjectMember.fulfilled, (state, action) => {
        if (action.payload && 'id' in action.payload) {
          state.projectMembers.push(action.payload);
        }
      })

      // Remove project member
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        state.projectMembers = state.projectMembers.filter(m => m.id !== action.payload);
      })

      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoadingUsers = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.availableUsers = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.error = action.error.message || 'Failed to fetch users';
      });
  },
});

export const {
  clearCurrentProject,
  clearError,
  setCurrentProject,
} = projectSlice.actions;

export default projectSlice.reducer;
