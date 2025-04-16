
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { useAuth } from './AuthContext';
import { groupsService } from '@/services/api';

// Types
export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
}

export interface Transaction {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  date: string;
  description?: string;
}

export interface WithdrawalRequest {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export interface SavingsGroup {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  createdDate: string;
  members: Member[];
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
}

interface SavingsContextType {
  groups: SavingsGroup[];
  userGroups: SavingsGroup[];
  getGroup: (id: string) => SavingsGroup | undefined;
  createGroup: (groupData: Omit<SavingsGroup, 'id' | 'createdDate' | 'currentAmount' | 'members' | 'transactions' | 'withdrawalRequests'>) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  contributeToGroup: (groupId: string, amount: number, description?: string) => Promise<void>;
  requestWithdrawal: (groupId: string, amount: number, reason?: string) => Promise<void>;
  approveWithdrawal: (groupId: string, requestId: string) => Promise<void>;
  rejectWithdrawal: (groupId: string, requestId: string) => Promise<void>;
  isLoading: boolean;
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export const SavingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [groups, setGroups] = useState<SavingsGroup[]>([]);
  const [userGroups, setUserGroups] = useState<SavingsGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all available groups for discovery
  const fetchDiscoverGroups = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await groupsService.discoverGroups();
      
      if (response.data?.groups) {
        setGroups(response.data.groups);
      }
    } catch (error) {
      console.error('Error fetching discover groups:', error);
    }
  };

  // Fetch user's groups
  const fetchUserGroups = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await groupsService.getGroups();
      
      if (response.data?.groups) {
        setUserGroups(response.data.groups);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  // Load data when auth state changes
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        setIsLoading(true);
        await Promise.all([fetchUserGroups(), fetchDiscoverGroups()]);
        setIsLoading(false);
      } else {
        setGroups([]);
        setUserGroups([]);
      }
    };
    
    loadData();
  }, [isAuthenticated]);

  // Get specific group details
  // Get specific group details
const getGroup = async (id: string): Promise<SavingsGroup | undefined> => {
  // First check in user groups
  const userGroup = userGroups.find(g => g.id === id);
  if (userGroup) return userGroup;
  
  // Then check in all groups
  const discoveredGroup = groups.find(g => g.id === id);
  if (discoveredGroup) return discoveredGroup;

  // If not found locally, fetch from API
  if (isAuthenticated) {
    try {
      const response = await groupsService.getGroupDetails(id);
      if (response.data?.group) {
        // Format the response to match SavingsGroup interface
        const fetchedGroup: SavingsGroup = {
          id: response.data.group.id,
          name: response.data.group.name,
          description: response.data.group.description,
          targetAmount: response.data.group.target_amount,
          currentAmount: response.data.group.current_amount,
          createdDate: response.data.group.created_at,
          members: response.data.group.members.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            avatar: m.avatar,
            isAdmin: m.is_admin
          })),
          transactions: response.data.group.contributions.map((c: any) => ({
            id: c.id,
            groupId: id,
            userId: c.user.id,
            userName: c.user.name,
            amount: c.amount,
            type: 'deposit',
            date: c.created_at,
            description: c.description
          })),
          withdrawalRequests: response.data.group.withdrawals.map((w: any) => ({
            id: w.id,
            groupId: id,
            userId: w.user.id,
            userName: w.user.name,
            amount: w.amount,
            date: w.created_at,
            status: w.status,
            reason: w.reason
          }))
        };
        
        return fetchedGroup;
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
  }
  
  return undefined;
};

  // Create a new group
  const createGroup = async (groupData: Omit<SavingsGroup, 'id' | 'createdDate' | 'currentAmount' | 'members' | 'transactions' | 'withdrawalRequests'>) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to create a group');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await groupsService.createGroup(groupData);
      
      if (response.data?.group) {
        // Refresh user groups to include the new one
        await fetchUserGroups();
        toast.success('Group created successfully!');
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Join an existing group
  const joinGroup = async (groupId: string) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to join a group');
      return;
    }

    try {
      const response = await groupsService.joinGroup(groupId);
      
      if (response.data) {
        // Update groups lists after joining
        await Promise.all([fetchUserGroups(), fetchDiscoverGroups()]);
        toast.success(`Joined group successfully!`);
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  // Leave a group (not directly supported by the API - would need to be added)
  const leaveGroup = async (groupId: string) => {
    toast.error('This feature is not implemented in the backend yet');
    return;
  };

  // Make a contribution to a group
  // Make a contribution to a group
const contributeToGroup = async (groupId: string, amount: number, description?: string) => {
  if (!isAuthenticated) {
    toast.error('You must be logged in to contribute');
    return;
  }

  if (amount <= 0) {
    toast.error('Contribution amount must be greater than zero');
    return;
  }

  try {
    // Find the group in userGroups
    const groupIndex = userGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      toast.error('Group not found');
      return;
    }

    // Create a new transaction object
    const newTransaction: Transaction = {
      id: `temp-${Date.now()}`, // Temporary ID until API response
      groupId,
      userId: user?.id || '',
      userName: user?.name || 'You',
      amount,
      type: 'deposit',
      date: new Date().toISOString(),
      description: description || 'Contribution'
    };

    // Update userGroups with the new transaction and amount
    const updatedGroups = [...userGroups];
    const updatedGroup = { ...updatedGroups[groupIndex] };
    
    // Ensure transactions array exists
    if (!updatedGroup.transactions) {
      updatedGroup.transactions = [];
    }
    
    // Add new transaction
    updatedGroup.transactions = [...updatedGroup.transactions, newTransaction];
    
    // Update current amount
    updatedGroup.currentAmount += amount;
    
    // Update the group in the array
    updatedGroups[groupIndex] = updatedGroup;
    
    // Update state immediately for UI responsiveness
    setUserGroups(updatedGroups);

    // Make API call
    const response = await groupsService.contributeToGroup(groupId, amount, description);
    
    if (response.data) {
      // Refresh group data after contribution to get server-generated IDs
      await fetchUserGroups();
      toast.success(`Contributed $${amount.toFixed(2)} successfully!`);
    }
  } catch (error) {
    console.error('Error making contribution:', error);
    toast.error('Failed to make contribution. Please try again.');
    
    // Revert the optimistic update on error
    await fetchUserGroups();
  }
};

  // Request a withdrawal from a group
  // Request a withdrawal from a group
// Fix for the requestWithdrawal function in SavingsContext.jsx
// Request a withdrawal from a group
const requestWithdrawal = async (groupId: string, amount: number, reason?: string) => {
  if (!isAuthenticated) {
    toast.error('You must be logged in to request a withdrawal');
    return;
  }

  if (amount <= 0) {
    toast.error('Withdrawal amount must be greater than zero');
    return;
  }

  try {
    // Find the group in userGroups
    const groupIndex = userGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      toast.error('Group not found');
      return;
    }

    // Get the group and check if withdrawalRequests exists
    const currentGroup = userGroups[groupIndex];
    if (!currentGroup.withdrawalRequests) {
      // Initialize withdrawalRequests if it doesn't exist
      currentGroup.withdrawalRequests = [];
    }

    // Create a new withdrawal request object
    const newWithdrawalRequest: WithdrawalRequest = {
      id: `temp-${Date.now()}`, // Temporary ID until API response
      groupId,
      userId: user?.id || '',
      userName: user?.name || 'You',
      amount,
      date: new Date().toISOString(),
      status: 'pending',
      reason: reason || 'Withdrawal request'
    };

    // Update userGroups with the new withdrawal request
    const updatedGroups = [...userGroups];
    const updatedGroup = { ...updatedGroups[groupIndex] };
    
    // Add new withdrawal request
    updatedGroup.withdrawalRequests = [...updatedGroup.withdrawalRequests, newWithdrawalRequest];
    
    // Update the group in the array
    updatedGroups[groupIndex] = updatedGroup;
    
    // Update state immediately for UI responsiveness
    setUserGroups(updatedGroups);

    // Make API call
    const response = await groupsService.requestWithdrawal(groupId, amount, reason);
    
    if (response.data) {
      // Refresh group data after requesting withdrawal to get server-generated IDs
      await fetchUserGroups();
      toast.success('Withdrawal request submitted for approval');
    }
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    toast.error('Failed to request withdrawal. Please try again.');
    
    // Revert the optimistic update on error
    await fetchUserGroups();
  }
};

  // Approve a withdrawal request
  // Approve a withdrawal request
  const approveWithdrawal = async (groupId: string, requestId: string) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to approve a withdrawal');
      return;
    }
  
    try {
      // Find the group in userGroups
      const groupIndex = userGroups.findIndex(g => g.id === groupId);
      
      if (groupIndex === -1) {
        toast.error('Group not found');
        return;
      }
  
      // Update userGroups with the approved withdrawal
      const updatedGroups = [...userGroups];
      const updatedGroup = { ...updatedGroups[groupIndex] };
      
      // Ensure withdrawalRequests array exists
      if (!updatedGroup.withdrawalRequests) {
        updatedGroup.withdrawalRequests = [];
        toast.error('No withdrawal requests found');
        return;
      }
      
      // Find the withdrawal request
      const requestIndex = updatedGroup.withdrawalRequests.findIndex(r => r.id === requestId);
      
      if (requestIndex === -1) {
        toast.error('Withdrawal request not found');
        return;
      }
      
      // Update the status
      const updatedRequests = [...updatedGroup.withdrawalRequests];
      updatedRequests[requestIndex] = {
        ...updatedRequests[requestIndex],
        status: 'approved'
      };
      
      // Update the withdrawal requests
      updatedGroup.withdrawalRequests = updatedRequests;
      
      // Deduct the amount from current amount (since it's now approved)
      const requestAmount = updatedRequests[requestIndex].amount;
      updatedGroup.currentAmount = Math.max(0, updatedGroup.currentAmount - requestAmount);
      
      // Add a new transaction for the withdrawal
      if (!updatedGroup.transactions) {
        updatedGroup.transactions = [];
      }
      
      updatedGroup.transactions = [
        ...updatedGroup.transactions,
        {
          id: `temp-withdrawal-${Date.now()}`,
          groupId,
          userId: updatedRequests[requestIndex].userId,
          userName: updatedRequests[requestIndex].userName,
          amount: requestAmount,
          type: 'withdrawal',
          date: new Date().toISOString(),
          description: `Approved withdrawal: ${updatedRequests[requestIndex].reason || ''}`
        }
      ];
      
      // Update the group in the array
      updatedGroups[groupIndex] = updatedGroup;
      
      // Update state immediately for UI responsiveness
      setUserGroups(updatedGroups);
  
      // Make API call
      const response = await groupsService.processWithdrawal(requestId, 'approved');
      
      if (response.data) {
        // Refresh group data after approval to get server-generated IDs
        await fetchUserGroups();
        toast.success('Withdrawal request approved');
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast.error('Failed to approve withdrawal. Please try again.');
      
      // Revert the optimistic update on error
      await fetchUserGroups();
    }
  };

// Reject a withdrawal request
const rejectWithdrawal = async (groupId: string, requestId: string) => {
  if (!isAuthenticated) {
    toast.error('You must be logged in to reject a withdrawal');
    return;
  }

  try {
    // Find the group in userGroups
    const groupIndex = userGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      toast.error('Group not found');
      return;
    }

    // Update userGroups with the rejected withdrawal
    const updatedGroups = [...userGroups];
    const updatedGroup = { ...updatedGroups[groupIndex] };
    
    // Ensure withdrawalRequests array exists
    if (!updatedGroup.withdrawalRequests) {
      updatedGroup.withdrawalRequests = [];
      toast.error('No withdrawal requests found');
      return;
    }
    
    // Find the withdrawal request
    const requestIndex = updatedGroup.withdrawalRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      toast.error('Withdrawal request not found');
      return;
    }
    
    // Update the status
    const updatedRequests = [...updatedGroup.withdrawalRequests];
    updatedRequests[requestIndex] = {
      ...updatedRequests[requestIndex],
      status: 'rejected'
    };
    
    // Update the withdrawal requests
    updatedGroup.withdrawalRequests = updatedRequests;
    
    // Update the group in the array
    updatedGroups[groupIndex] = updatedGroup;
    
    // Update state immediately for UI responsiveness
    setUserGroups(updatedGroups);

    // Make API call
    const response = await groupsService.processWithdrawal(requestId, 'rejected');
    
    if (response.data) {
      // Refresh group data after rejection to get server-generated IDs
      await fetchUserGroups();
      toast.success('Withdrawal request rejected');
    }
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    toast.error('Failed to reject withdrawal. Please try again.');
    
    // Revert the optimistic update on error
    await fetchUserGroups();
  }
};

  return (
    <SavingsContext.Provider
      value={{
        groups,
        userGroups,
        getGroup,
        createGroup,
        joinGroup,
        leaveGroup,
        contributeToGroup,
        requestWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        isLoading,
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
};

export const useSavings = () => {
  const context = useContext(SavingsContext);
  if (context === undefined) {
    throw new Error('useSavings must be used within a SavingsProvider');
  }
  return context;
};
