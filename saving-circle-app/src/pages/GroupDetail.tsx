
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useSavings } from '@/contexts/SavingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CircleProgress from '@/components/savings/CircleProgress';
import ProgressBar from '@/components/savings/ProgressBar';
import TransactionList from '@/components/savings/TransactionList';
import WithdrawalRequests from '@/components/savings/WithdrawalRequests';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  ArrowDownCircle, 
  LogOut, 
  AlertCircle,
  Wallet,
  Loader
} from 'lucide-react';
import { toast } from 'sonner';
import { groupsService } from '@/services/api';
import { SavingsGroup } from '@/contexts/SavingsContext';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userGroups, leaveGroup, contributeToGroup, requestWithdrawal, approveWithdrawal, rejectWithdrawal } = useSavings();
  const { user } = useAuth();
  
  const [group, setGroup] = useState<SavingsGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionDescription, setContributionDescription] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [contributionOpen, setContributionOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  
  // Fetch group details directly instead of relying on context
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // First check if the group exists in userGroups
        const existingGroup = userGroups.find(g => g.id === id);
        
        if (existingGroup) {
          setGroup(existingGroup);
          setIsLoading(false);
          return;
        }
        
        // If not found in user groups, fetch directly
        const response = await groupsService.getGroupDetails(id);
        
        if (response.data && response.data.group) {
          const apiGroup = response.data.group;
          console.log("API Group data:", apiGroup);
          
          // Create a properly structured group object with default values where needed
          const transformedGroup: SavingsGroup = {
            id: apiGroup.id || id,
            name: apiGroup.name || 'Unnamed Group',
            description: apiGroup.description || '',
            targetAmount: Number(apiGroup.target_amount) || 0,
            currentAmount: Number(apiGroup.current_amount) || 0,
            createdDate: apiGroup.created_at || new Date().toISOString(),
            members: Array.isArray(apiGroup.members) 
              ? apiGroup.members.map((m: any) => ({
                id: m.id || '',
                name: m.name || 'Unknown Member',
                email: m.email || '',
                avatar: m.avatar || undefined,
                isAdmin: Boolean(m.is_admin)
              }))
              : [{
                id: user?.id || '',
                name: user?.name || 'You',
                email: user?.email || '',
                avatar: user?.avatar,
                isAdmin: true
              }],
            transactions: Array.isArray(apiGroup.contributions) 
              ? apiGroup.contributions.map((c: any) => ({
                id: c.id || '',
                groupId: apiGroup.id || id,
                userId: c.user?.id || '',
                userName: c.user?.name || 'Unknown User',
                amount: Number(c.amount) || 0,
                type: 'deposit',
                date: c.created_at || new Date().toISOString(),
                description: c.description || ''
              }))
              : [],
            withdrawalRequests: Array.isArray(apiGroup.withdrawals) 
              ? apiGroup.withdrawals.map((w: any) => ({
                id: w.id || '',
                groupId: apiGroup.id || id,
                userId: w.user?.id || '',
                userName: w.user?.name || 'Unknown User',
                amount: Number(w.amount) || 0,
                date: w.created_at || new Date().toISOString(),
                status: w.status || 'pending',
                reason: w.reason || ''
              }))
              : []
          };
          
          console.log("Transformed Group:", transformedGroup);
          setGroup(transformedGroup);
        } else {
          console.error('Failed to load group data:', response);
          setError('Could not load group data');
        }
      } catch (err) {
        console.error('Error fetching group details:', err);
        setError('Failed to load group data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGroupDetails();
  }, [id, userGroups, user]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Loading group details...</p>
        </div>
      </Layout>
    );
  }
  
  if (error || !group) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Group Not Found</h1>
          <p className="text-gray-500 mb-6">{error || "The group you're looking for doesn't exist or you don't have access to it."}</p>
          <Button onClick={() => navigate('/groups')}>Go Back to Groups</Button>
        </div>
      </Layout>
    );
  }
  
  // Additional null checks to prevent undefined errors
  if (!Array.isArray(group.members) || group.currentAmount === undefined || group.targetAmount === undefined) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Invalid Group Data</h1>
          <p className="text-gray-500 mb-6">The group data is incomplete or corrupted.</p>
          <Button onClick={() => navigate('/groups')}>Go Back to Groups</Button>
        </div>
      </Layout>
    );
  }

  const isUserMember = group.members.some(member => member.id === user?.id);
  const isAdmin = group.members.find(member => member.id === user?.id)?.isAdmin;
  const savingsPercentage = (group.currentAmount / group.targetAmount) * 100;
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const handleContribute = () => {
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    contributeToGroup(group.id, amount, contributionDescription || undefined);
    setContributionAmount('');
    setContributionDescription('');
    setContributionOpen(false);
  };


  
  
  const handleWithdrawalRequest = () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > group.currentAmount) {
      toast.error('Withdrawal amount exceeds available funds');
      return;
    }

    
    
    requestWithdrawal(group.id, amount, withdrawalReason || undefined);
    setWithdrawalAmount('');
    setWithdrawalReason('');
    setWithdrawalOpen(false);
  };
  


  
  // In GroupDetail.tsx, update these functions:

const handleApproveWithdrawal = (requestId: string) => {
  console.log("Approving withdrawal:", requestId);
  console.log("Group withdrawal requests:", group.withdrawalRequests);
  
  // Make sure the withdrawal request exists before calling the function
  if (group.withdrawalRequests && group.withdrawalRequests.some(req => req.id === requestId)) {
    approveWithdrawal(group.id, requestId);
  } else {
    console.error("Request ID not found in group withdrawal requests");
    toast.error("Error: Could not find withdrawal request");
  }
};

const handleRejectWithdrawal = (requestId: string) => {
  console.log("Rejecting withdrawal:", requestId);
  console.log("Group withdrawal requests:", group.withdrawalRequests);
  
  // Make sure the withdrawal request exists before calling the function
  if (group.withdrawalRequests && group.withdrawalRequests.some(req => req.id === requestId)) {
    rejectWithdrawal(group.id, requestId);
  } else {
    console.error("Request ID not found in group withdrawal requests");
    toast.error("Error: Could not find withdrawal request");
  }
};
  
  const handleLeaveGroup = () => {
    leaveGroup(group.id);
    navigate('/groups');
  };
  
  if (!isUserMember) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-gray-500 mb-6">You need to join this group to view its details.</p>
          <Button onClick={() => navigate('/groups')}>Go Back to Groups</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{group.name}</h1>
        <p className="text-gray-500">{group.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Current Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-savings-blue-700">${group.currentAmount.toFixed(2)}</div>
            <div className="mt-4">
              <ProgressBar current={group.currentAmount} target={group.targetAmount} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-around">
            <CircleProgress percentage={savingsPercentage} />
            <div className="text-center">
              <div className="text-sm text-gray-500">Target</div>
              <div className="text-2xl font-bold text-savings-blue-700">${group.targetAmount.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {group.members.slice(0, 5).map((member) => (
                  <Avatar key={member.id} className="border-2 border-white">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="bg-savings-blue-100 text-savings-blue-700">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {group.members.length > 5 && (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 border-2 border-white text-xs font-medium">
                    +{group.members.length - 5}
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-savings-blue-700">
                {group.members.length}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-gray-500">
                  <LogOut className="mr-2 h-4 w-4" /> Leave Group
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isAdmin && group.members.length > 1 ? (
                      "You're the admin of this group. You can't leave while there are other members."
                    ) : (
                      "This will remove you from the group. You won't be able to access it unless you rejoin."
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  {!(isAdmin && group.members.length > 1) && (
                    <AlertDialogAction onClick={handleLeaveGroup}>Leave Group</AlertDialogAction>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <Dialog open={contributionOpen} onOpenChange={setContributionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Contribute
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contribute to Group</DialogTitle>
              <DialogDescription>
                Add funds to your savings group. All contributions are tracked.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What's this contribution for?"
                  value={contributionDescription}
                  onChange={(e) => setContributionDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setContributionOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleContribute}>Contribute</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={withdrawalOpen} onOpenChange={setWithdrawalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <ArrowDownCircle className="mr-2 h-4 w-4" /> Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
              <DialogDescription>
                Admin approval is required for all withdrawals from the group.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-md">
                <span>Available Funds:</span>
                <span className="font-bold">${group.currentAmount.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawAmount">Amount ($)</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={group.currentAmount}
                  placeholder="0.00"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Why do you need to withdraw these funds?"
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWithdrawalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleWithdrawalRequest}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Record of all deposits and withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList transactions={group.transactions || []} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>
                {isAdmin 
                  ? 'Manage withdrawal requests from group members' 
                  : 'View status of your withdrawal requests'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WithdrawalRequests 
                requests={group.withdrawalRequests || []} 
                onApprove={handleApproveWithdrawal}
                onReject={handleRejectWithdrawal}
                isAdmin={isAdmin}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Group Members</CardTitle>
              <CardDescription>People participating in this savings group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <Avatar className="mr-3">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-savings-blue-100 text-savings-blue-700">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    {member.isAdmin && (
                      <span className="text-xs bg-savings-blue-100 text-savings-blue-700 px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default GroupDetail;
