import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSavings } from '@/contexts/SavingsContext';
import CircleProgress from '@/components/savings/CircleProgress';
import { 
  ArrowUpRight, 
  PlusCircle, 
  Users,
  Wallet,
  ArrowRight,
  BarChart3,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { userGroups = [] } = useSavings();

  // Ensure userGroups is an array and filter out any undefined or null entries
  const validGroups = Array.isArray(userGroups) ? userGroups.filter(group => group) : [];

  // Calculate total savings across all groups with safety checks
  const totalSavings = validGroups.reduce((sum, group) => sum + (group.currentAmount || 0), 0);
  
  // Calculate total targets across all groups with safety checks
  const totalTargets = validGroups.reduce((sum, group) => sum + (group.targetAmount || 0), 0);
  
  // Get percentage of total savings vs targets
  const savingsPercentage = totalTargets > 0 
    ? Math.min((totalSavings / totalTargets) * 100, 100) 
    : 0;
  
  // Safely gather transactions with null checks
  const allTransactions = validGroups.flatMap(group => group?.transactions || []);
  
  // Sort by date (newest first)
  const recentTransactions = [...allTransactions]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 5);

  return (
    <Layout>
      <div className="mb-8 animate-fade-in">
        <h1 className="page-heading">Welcome, {user?.name || 'User'}</h1>
        <p className="text-gray-500">Track your savings progress and activities</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="stats-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div>
                <div className="stats-number">${totalSavings.toFixed(2)}</div>
                <div className="text-sm text-gray-500">across {validGroups.length} groups</div>
              </div>
              <div className="ml-auto p-3 rounded-full bg-blue-50 animate-float">
                <Wallet className="h-10 w-10 text-apple-blue-dark" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Saving Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <CircleProgress percentage={savingsPercentage} size={80} fontSize={18} />
            <div className="text-right">
              <div className="text-sm text-gray-500">Target</div>
              <div className="stats-number">${totalTargets.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div>
                <div className="stats-number">{validGroups.length}</div>
                <div className="text-sm text-gray-500">active groups</div>
              </div>
              <div className="ml-auto p-3 rounded-full bg-purple-50 animate-float">
                <Users className="h-10 w-10 text-apple-purple-dark" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 modern-card" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-full hover-lift">
              <Link to="/groups">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div>
                {recentTransactions.map((tx, index) => (
                  <div 
                    key={tx?.id || index} 
                    className={`transaction-item ${tx?.type === 'deposit' ? 'deposit' : 'withdrawal'} animate-fade-in`}
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{tx?.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</div>
                        <div className="text-sm text-gray-500">
                          {tx?.userName || 'User'} - {tx?.groupName || 'Group'} - {new Date(tx?.date || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        tx?.type === 'deposit' ? 'text-apple-blue-dark' : 'text-savings-orange-500'
                      }`}>
                        {tx?.type === 'deposit' ? '+' : '-'}${(tx?.amount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No transaction activity to display</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 modern-card" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Savings Groups</CardTitle>
              <CardDescription>Groups you're participating in</CardDescription>
            </div>
            <Button size="sm" asChild className="rounded-full apple-gradient-blue hover-lift">
              <Link to="/groups/new">
                <PlusCircle className="mr-1 h-4 w-4" /> Create Group
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {validGroups.length > 0 ? (
              <div className="space-y-4">
                {validGroups.slice(0, 3).map((group, index) => (
                  <div 
                    key={group?.id || index} 
                    className="flex items-center justify-between p-4 rounded-xl glass-card hover-lift animate-fade-in"
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  >
                    <div>
                      <div className="font-medium">{group?.name || 'Unnamed Group'}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Users className="h-3 w-3 mr-1" /> {group?.members?.length || 0} members
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        ${(group?.currentAmount || 0).toFixed(2)} / ${(group?.targetAmount || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-apple-blue-dark flex items-center justify-end">
                        <TrendingUp className="h-3 w-3 mr-1" /> 
                        {Math.round(((group?.currentAmount || 0) / (group?.targetAmount || 1)) * 100)}%
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-blue-50">
                      <Link to={`/groups/${group?.id}`}>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
                
                {validGroups.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full rounded-full hover-lift" asChild>
                    <Link to="/groups">
                      View all {validGroups.length} groups
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="mb-4">You haven't joined any savings groups yet</p>
                <Button asChild className="rounded-full apple-gradient-blue hover-lift">
                  <Link to="/discover">
                    Discover Groups
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;