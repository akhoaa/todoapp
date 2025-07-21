import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '28rem',
        width: '100%',
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#111827',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          ToDo App Login ✅
        </h1>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.25rem'
          }}>
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.25rem'
          }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          Sign In
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          React is working! 🎉
        </p>
      </div>
    </div>
  );
}

export default App;
