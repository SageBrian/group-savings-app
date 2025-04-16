import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Wallet } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressBar from './ProgressBar';
import { SavingsGroup } from '@/contexts/SavingsContext';

interface GroupCardProps {
  group: SavingsGroup;
  onJoin?: () => void;
  isUserMember?: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin, isUserMember = false }) => {
  // Check if group exists and has required properties
  if (!group) {
    return null; // Don't render anything if group is null or undefined
  }
  
  // Safely access all properties with default values
  const name = group.name || 'Unnamed Group';
  const description = group.description || 'No description available';
  const currentAmount = group.currentAmount || 0;
  const targetAmount = group.targetAmount || 0;
  const membersCount = group.members?.length || 0;
  const createdDate = group.createdDate ? new Date(group.createdDate) : new Date();
  const id = group.id || 'unknown';
  
  // Calculate percentage safely
  const percentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{name}</CardTitle>
          <div className="text-xs font-medium bg-savings-blue-50 text-savings-blue-700 rounded-full px-2 py-1 flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {membersCount}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="mb-4 mt-2">
          <ProgressBar current={currentAmount} target={targetAmount} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-md p-2 text-center">
            <div className="text-gray-500">Current</div>
            <div className="font-semibold text-savings-blue-700">
              ${currentAmount.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-md p-2 text-center">
            <div className="text-gray-500">Target</div>
            <div className="font-semibold text-savings-blue-700">
              ${targetAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-gray-500">
          Created: {createdDate.toLocaleDateString()}
        </div>
        {isUserMember ? (
          <Button asChild size="sm">
            <Link to={`/groups/${id}`}>
              <Wallet className="h-4 w-4 mr-1" /> View Details
            </Link>
          </Button>
        ) : (
          <Button size="sm" onClick={onJoin}>
            <Users className="h-4 w-4 mr-1" /> Join Group
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GroupCard;