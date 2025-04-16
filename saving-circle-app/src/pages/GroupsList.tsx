
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GroupCard from '@/components/savings/GroupCard';
import { useSavings } from '@/contexts/SavingsContext';
import { PlusCircle, Search } from 'lucide-react';

const GroupsList = () => {
  const { userGroups } = useSavings();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredGroups = searchTerm 
    ? userGroups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : userGroups;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Savings Groups</h1>
          <p className="text-gray-500">Manage and track your savings groups</p>
        </div>
        <Button asChild>
          <Link to="/groups/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Group
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search groups by name or description..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} isUserMember={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          {searchTerm ? (
            <>
              <h3 className="text-lg font-medium mb-2">No matching groups found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or explore new groups to join
              </p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium mb-2">You haven't joined any groups yet</h3>
              <p className="text-gray-500 mb-4">
                Create a new group or discover existing ones to join
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild>
                  <Link to="/groups/new">Create Group</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/discover">Discover Groups</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Layout>
  );
};

export default GroupsList;
