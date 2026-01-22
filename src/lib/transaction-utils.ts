
export const isDueSoon = (dateString?: string) => {
    if (!dateString) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
};

export const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    return due < today;
};

export const getUrgencyScore = (transaction: any) => {
    let score = 0;
    const dateString = transaction.dueDate;
    const amount = transaction.amount || 0;
    score += transaction.type === 'debt' ? 100 : 50;
    if (!dateString) { score -= 50; }
    else {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const due = new Date(dateString);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) { score += 500; }
        else if (diffDays <= 1) { score += 300; }
        else if (diffDays <= 7) { score += 150; }
        else if (diffDays <= 30) { score += 20; }
    }
    score += amount / 10;
    if (!transaction.cleared) { score += 10; }
    return Math.round(score);
};
