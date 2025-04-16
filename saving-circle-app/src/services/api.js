
import { toast } from "sonner";

// Base API URL - adjust for production/development environments
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generic fetch function with error handling
async function fetchApi(
  endpoint, 
  options = {}
) {
  try {
    const token = localStorage.getItem('authToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Show error toast for failed requests
      toast.error(data.error || 'Something went wrong');
      return { error: data.error || 'Request failed' };
    }
    
    return { data };
    
  } catch (error) {
    console.error('API request failed:', error);
    toast.error('Network error, please try again');
    return { error: 'Network error' };
  }
}

// Auth Services
export const authService = {
  login: async (email, password) => {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  register: async (name, email, password) => {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
  
  getProfile: async () => {
    return fetchApi('/profile');
  },
  
  updateProfile: async (data) => {
    return fetchApi('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Groups Services
export const groupsService = {
  getGroups: async () => {
    return fetchApi('/groups');
  },
  
  getGroupDetails: async (groupId) => {
    return fetchApi(`/groups/${groupId}`);
  },
  
  createGroup: async (groupData) => {
    return fetchApi('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  },
  
  joinGroup: async (groupId) => {
    return fetchApi(`/groups/${groupId}/join`, {
      method: 'POST',
    });
  },
  
  contributeToGroup: async (groupId, amount) => {
    return fetchApi(`/groups/${groupId}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },
  
  requestWithdrawal: async (groupId, amount, reason) => {
    return fetchApi(`/groups/${groupId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  },
  
  processWithdrawal: async (withdrawalId, status) => {
    return fetchApi(`/withdrawals/${withdrawalId}/process`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },
  
  discoverGroups: async () => {
    return fetchApi('/discover');
  },
};

export default {
  auth: authService,
  groups: groupsService,
};
