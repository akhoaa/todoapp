import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, App as AntdApp } from 'antd';
import { store } from '@/redux/store';

// Suppress React 19 compatibility warnings for Antd v5
// This is a known issue: https://github.com/ant-design/ant-design/issues/51458
// The functionality is not affected, only warnings are shown
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Enhanced warning suppression for Antd React 19 compatibility
const suppressAntdWarnings = (...args: any[]) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress all Antd React 19 compatibility warnings
    if (
      message.includes('[antd: compatible]') ||
      message.includes('antd v5 support React is 16 ~ 18') ||
      message.includes('Accessing element.ref was removed in React 19') ||
      message.includes('Warning: Accessing element.ref') ||
      message.includes('ref is now a regular prop') ||
      // Suppress warnings from Antd internal functions
      (message.includes('Warning:') && (
        message.includes('showWaveEffect') ||
        message.includes('defaultReactRender') ||
        message.includes('wave') ||
        message.includes('antd')
      ))
    ) {
      return true; // Suppress this warning
    }
  }
  return false; // Don't suppress
};

console.warn = (...args) => {
  if (!suppressAntdWarnings(...args)) {
    originalConsoleWarn.apply(console, args);
  }
};

console.error = (...args) => {
  if (!suppressAntdWarnings(...args)) {
    originalConsoleError.apply(console, args);
  }
};
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAccount, setLoadingFalse } from '@/redux/slice/accountSlice';

// Components
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import Profile from '@/pages/Profile';

// Styles
import 'antd/dist/reset.css';

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector(state => state.account);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (token && !isAuthenticated) {
      dispatch(fetchAccount());
    } else if (!token) {
      // If no token, set loading to false immediately
      dispatch(setLoadingFalse());
    }
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <AntdApp>
          <AppContent />
        </AntdApp>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
