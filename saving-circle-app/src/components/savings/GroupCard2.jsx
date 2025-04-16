
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Wallet } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressBar from './ProgressBar';

const GroupCard = ({ group, onJoin, isUserMember = false }) => {
  const percentage = Math.min((group.currentAmount / group.targetAmount) * 100, 100);
  

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{group.name}</CardTitle>
          <div className="text-xs font-medium bg-savings-blue-50 text-savings-blue-700 rounded-full px-2 py-1 flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {group.members.length}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">{group.description}</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="mb-4 mt-2">
          <ProgressBar current={group.currentAmount} target={group.targetAmount} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-md p-2 text-center">
            <div className="text-gray-500">Current</div>
            <div className="font-semibold text-savings-blue-700">
              ${group.currentAmount.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-md p-2 text-center">
            <div className="text-gray-500">Target</div>
            <div className="font-semibold text-savings-blue-700">
              ${group.targetAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-gray-500">
          Created: {new Date(group.createdDate).toLocaleDateString()}
        </div>
        {isUserMember ? (
          <Button asChild size="sm">
            <Link to={`/groups/${group.id}`}>
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
