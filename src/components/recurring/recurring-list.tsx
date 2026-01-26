import React from 'react';
import { Repeat } from 'lucide-react';
import type { RecurringTransaction } from '@/types';
import { RecurringCard } from './recurring-card';

interface RecurringListProps {
    recurringTransactions: RecurringTransaction[];
    onSelect: (item: RecurringTransaction) => void;
    onToggleActive: (id: string, active: boolean) => void;
    onDelete: (id: string) => void;
}

export const RecurringList: React.FC<RecurringListProps> = ({
    recurringTransactions,
    onSelect,
    onToggleActive,
    onDelete
}) => {
    if (recurringTransactions.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 py-12">
                <Repeat size={40} className="mb-4 opacity-20" />
                <p className="text-sm">No recurring transactions due in the next 7 days.</p>
                <p className="text-xs text-gray-700 mt-2">Add recurring transactions to see them here when they're due soon.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {recurringTransactions.map((item) => (
                <RecurringCard
                    key={item.id}
                    item={item}
                    onClick={onSelect}
                    onToggleActive={onToggleActive}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
