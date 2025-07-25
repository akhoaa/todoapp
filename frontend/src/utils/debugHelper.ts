/**
 * Debug helper utilities for troubleshooting API issues
 */

export const debugApiCall = async (url: string, method: string, data?: any) => {
  console.group(`🔍 API Debug: ${method} ${url}`);
  
  try {
    // Log request details
    console.log('📤 Request Data:', data);
    console.log('🌐 Base URL:', import.meta.env.VITE_BACKEND_URL);
    console.log('🔗 Full URL:', `${import.meta.env.VITE_BACKEND_URL}${url}`);
    
    // Test backend connectivity
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    console.log('🏥 Testing backend connectivity...');
    
    try {
      const healthCheck = await fetch(backendUrl);
      console.log('✅ Backend is reachable:', healthCheck.status);
    } catch (connectError) {
      console.error('❌ Backend connection failed:', connectError);
    }
    
    // Log environment variables
    console.log('⚙️ Environment:', {
      VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    console.groupEnd();
  }
};

export const debugRegistrationPayload = (formData: any) => {
  console.group('🔍 Registration Payload Debug');
  
  console.log('📝 Form Data:', formData);
  console.log('📋 Field Analysis:');
  
  // Check each required field
  const requiredFields = ['email', 'password', 'name'];
  requiredFields.forEach(field => {
    const value = formData[field];
    console.log(`  ${field}:`, {
      present: value !== undefined,
      type: typeof value,
      length: typeof value === 'string' ? value.length : 'N/A',
      value: field === 'password' ? '***' : value
    });
  });
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.email) {
    console.log('📧 Email validation:', emailRegex.test(formData.email));
  }
  
  // Validate password length
  if (formData.password) {
    console.log('🔒 Password validation:', {
      length: formData.password.length,
      meetsMinimum: formData.password.length >= 6
    });
  }
  
  console.groupEnd();
};

export const debugErrorResponse = (error: any) => {
  console.group('🔍 Error Response Debug');
  
  console.log('❌ Full Error Object:', error);
  
  if (error.response) {
    console.log('📡 Response Details:', {
      status: error.response.status,
      statusText: error.response.statusText,
      headers: error.response.headers,
      data: error.response.data
    });
    
    // Specific handling for 400 errors
    if (error.response.status === 400) {
      console.log('🚨 400 Bad Request Analysis:');
      console.log('  - Check if all required fields are present');
      console.log('  - Verify field validation rules');
      console.log('  - Check for duplicate email');
      console.log('  - Verify backend server is running');
    }
  } else if (error.request) {
    console.log('📡 Request made but no response:', error.request);
    console.log('🚨 Possible causes:');
    console.log('  - Backend server is not running');
    console.log('  - CORS issues');
    console.log('  - Network connectivity problems');
  } else {
    console.log('⚙️ Error in setting up request:', error.message);
  }
  
  console.groupEnd();
};
