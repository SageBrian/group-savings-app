import { toast } from "sonner";
import { SavingsGroup } from "@/contexts/SavingsContext";

// Base API URL - adjust for production/development environments
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Interface for API response
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth response types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface ProfileResponse {
  user: User;
}

interface GroupsResponse {
  groups: SavingsGroup[];
}

interface GroupResponse {
  group: SavingsGroup;
}

// Generic fetch function with error handling
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('authToken');
    
    const headers: HeadersInit = {
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
    
    // Log response for debugging
    console.log(`API response for ${endpoint}:`, await response.clone().text());
    
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
  login: async (email: string, password: string) => {
    return fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  register: async (name: string, email: string, password: string) => {
    return fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
  
  getProfile: async () => {
    return fetchApi<ProfileResponse>('/profile');
  },
  
  updateProfile: async (data: Partial<User>) => {
    return fetchApi<ProfileResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Groups Services
export const groupsService = {
  getGroups: async () => {
    return fetchApi<GroupsResponse>('/groups');
  },
  
  getGroupDetails: async (groupId: string) => {
    return fetchApi<GroupResponse>(`/groups/${groupId}`);
  },
  
  createGroup: async (groupData: any) => {
    return fetchApi<GroupResponse>('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  },
  
  joinGroup: async (groupId: string) => {
    return fetchApi<any>(`/groups/${groupId}/join`, {
      method: 'POST',
    });
  },
  
  contributeToGroup: async (groupId: string, amount: number) => {
    return fetchApi<any>(`/groups/${groupId}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },
  
  requestWithdrawal: async (groupId: string, amount: number, reason?: string) => {
    return fetchApi<any>(`/groups/${groupId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  },
  
  processWithdrawal: async (withdrawalId: string, status: 'approved' | 'rejected') => {
    return fetchApi<any>(`/withdrawals/${withdrawalId}/process`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },
  
  discoverGroups: async () => {
    return fetchApi<GroupsResponse>('/discover');
  },
};

export default {
  auth: authService,
  groups: groupsService,
};