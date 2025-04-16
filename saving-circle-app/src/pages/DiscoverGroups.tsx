
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GroupCard from '@/components/savings/GroupCard';
import { useSavings } from '@/contexts/SavingsContext';
import { Search, Users, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DiscoverGroups = () => {
  const { groups, userGroups, joinGroup } = useSavings();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter out groups the user is already a member of
  const userGroupIds = userGroups.map(group => group.id);
  const availableGroups = groups.filter(group => !userGroupIds.includes(group.id));

  const filteredGroups = searchTerm 
    ? availableGroups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableGroups;

  const handleJoinGroup = (groupId: string) => {
    joinGroup(groupId);
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Discover Groups</h1>
          <p className="text-gray-500">Find and join savings groups</p>
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
            <GroupCard 
              key={group.id} 
              group={group} 
              onJoin={() => handleJoinGroup(group.id)} 
              isUserMember={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          {searchTerm ? (
            <>
              <h3 className="text-lg font-medium mb-2">No matching groups found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or create your own group
              </p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No groups available to join</h3>
              <p className="text-gray-500 mb-4">
                All available groups have been joined, or no groups exist yet
              </p>
              <Button asChild>
                <Link to="/groups/new">Create Your Own Group</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </Layout>
  );
};

export default DiscoverGroups;
