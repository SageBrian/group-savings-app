
import React from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const TransactionList = ({
  transactions,
  className = '',
  limit,
}) => {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const displayTransactions = limit
    ? sortedTransactions.slice(0, limit)
    : sortedTransactions;

  if (displayTransactions.length === 0) {
    return (
      <div className={`text-center py-6 text-gray-500 ${className}`}>
        No transactions to display
      </div>
    );
  }

  return (
    <div className={className}>
      {displayTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className={`transaction-item ${
            transaction.type === 'deposit' ? 'deposit' : 'withdrawal'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {transaction.type === 'deposit' ? (
                <ArrowUpCircle className="mr-2 h-5 w-5 text-savings-green-600" />
              ) : (
                <ArrowDownCircle className="mr-2 h-5 w-5 text-savings-orange-500" />
              )}
              <div>
                <div className="font-medium">
                  {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} by {transaction.userName}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()} 
                  {transaction.description && ` - ${transaction.description}`}
                </div>
              </div>
            </div>
            <div className={`font-semibold ${
              transaction.type === 'deposit' ? 'text-savings-green-600' : 'text-savings-orange-500'
            }`}>
              {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
