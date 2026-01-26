import { supabase } from './supabase';
import { calculateNextDueDate } from './recurring-utils';
import type { RecurringTransaction } from '@/types';

/**
 * Process recurring transactions and auto-create regular transactions when due
 */
export const processRecurringTransactions = async (
    recurringTransactions: RecurringTransaction[],
    userId: string
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
                // Create regular transaction from recurring
                const newTransaction = {
                    user_id: userId,
                    type: recurring.type,
                    name: `${recurring.name} (Auto)`,
                    amount: recurring.amount,
                    note: recurring.note || `Auto-created from recurring transaction`,
                    contact: recurring.contact,
                    due_date: recurring.next_due_date,
                    returns_percentage: null,
                    cleared: false,
                    created_at: new Date().toISOString()
                };

                const { error: insertError } = await supabase
                    .from('transactions')
                    .insert([newTransaction]);

                if (insertError) {
                    console.error('Error creating transaction from recurring:', insertError);
                    continue;
                }

                // Calculate next due date
                const newNextDue = calculateNextDueDate(nextDue, recurring.frequency);

                // Update recurring transaction with new next_due_date and last_generated_date
                const { error: updateError } = await supabase
                    .from('recurring_transactions')
                    .update({
                        next_due_date: newNextDue.toISOString().split('T')[0],
                        last_generated_date: nextDue.toISOString().split('T')[0]
                    })
                    .eq('id', recurring.id);

                if (updateError) {
                    console.error('Error updating recurring transaction:', updateError);
                    continue;
                }

                transactionsCreated++;
            } catch (error) {
                console.error('Error processing recurring transaction:', error);
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
