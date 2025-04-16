
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const WithdrawalRequests = ({
  requests,
  className = '',
  onApprove,
  onReject,
  isAdmin = false,
}) => {
  if (requests.length === 0) {
    return (
      <div className={`text-center py-6 text-gray-500 ${className}`}>
        No withdrawal requests
      </div>
    );
  }

  // Sort requests with pending ones first, then by date (newest first)
  const sortedRequests = [...requests].sort((a, b) => {
    // First sort by status (pending first)
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    // Then sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className={className}>
      {sortedRequests.map((request) => (
        <div
          key={request.id}
          className={`withdraw-request ${request.status}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {request.status === 'pending' ? (
                <Clock className="mr-2 h-5 w-5 text-savings-orange-500" />
              ) : request.status === 'approved' ? (
                <CheckCircle className="mr-2 h-5 w-5 text-savings-green-600" />
              ) : (
                <XCircle className="mr-2 h-5 w-5 text-destructive" />
              )}
              <div>
                <div className="font-medium">
                  Withdrawal Request by {request.userName}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(request.date).toLocaleDateString()}
                  {request.reason && ` - ${request.reason}`}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-semibold mb-1">${request.amount.toFixed(2)}</div>
              {isAdmin && request.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 bg-white border-savings-green-600 text-savings-green-600 hover:bg-savings-green-50"
                    onClick={() => onApprove && onApprove(request.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 bg-white border-destructive text-destructive hover:bg-red-50"
                    onClick={() => onReject && onReject(request.id)}
                  >
                    Reject
                  </Button>
                </div>
              )}
              {!isAdmin && request.status === 'pending' && (
                <span className="text-xs bg-savings-orange-500 text-white px-2 py-1 rounded-full">
                  Pending
                </span>
              )}
              {request.status === 'approved' && (
                <span className="text-xs bg-savings-green-600 text-white px-2 py-1 rounded-full">
                  Approved
                </span>
              )}
              {request.status === 'rejected' && (
                <span className="text-xs bg-destructive text-white px-2 py-1 rounded-full">
                  Rejected
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WithdrawalRequests;
