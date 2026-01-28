import { supabase } from './supabase';
import type { RecurringTransaction } from '@/types';

/**
 * Process recurring transactions and auto-create regular transactions when due
 */
export const processRecurringTransactions = async (
    recurringTransactions: RecurringTransaction[]
): Promise<number> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let transactionsCreated = 0;

    for (const recurring of recurringTransactions) {
        // Skip if not active or auto-creation disabled
        if (!recurring.active || recurring.auto_create_transaction === false) {
            continue;
        }

        const nextDue = new Date(recurring.next_due_date);
        nextDue.setHours(0, 0, 0, 0);

        const lastGenerated = recurring.last_generated_date
            ? new Date(recurring.last_generated_date)
            : null;

        // Check if due date is today or in the past
        // AND we haven't already generated a transaction for this due date
        if (nextDue <= today) {
            // Prevent duplicate creation - check if we already generated for this due date
            if (lastGenerated) {
                lastGenerated.setHours(0, 0, 0, 0);
                if (lastGenerated.getTime() === nextDue.getTime()) {
                    continue; // Already generated for this due date
                }
            }

            try {
                // Call DB RPC to atomically create transaction and advance recurring row
                const { data, error: rpcError } = await supabase.rpc('create_transaction_from_recurring', { rec_id: recurring.id });

                if (rpcError) {
                    console.error('RPC error creating transaction from recurring:', rpcError);
                    continue;
                }

                // The RPC returns 1 when a transaction was created, 0 otherwise
                const created = Array.isArray(data) ? data[0] : data;
                if (created === 1 || created === '1') {
                    transactionsCreated++;
                }
            } catch (error) {
                console.error('Error processing recurring transaction RPC:', error);
            }
        }
    }

    return transactionsCreated;
};

/**
 * Show notification to user about auto-created transactions
 */
export const showAutoCreationNotification = (count: number) => {
    if (count === 0) return;

    const message = count === 1
        ? '1 transaction auto-created from recurring'
        : `${count} transactions auto-created from recurring`;

    // Create a toast notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('SOVEREIGN Debt Tracker', {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }

    // Also log to console
    console.log(`✅ ${message}`);
};
