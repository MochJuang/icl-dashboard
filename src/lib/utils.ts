import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, decimals = 2): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount);
}

export function formatDate(dateString: string): string {
    if (!dateString || dateString === '0001-01-01T00:00:00Z') {
        return '-';
    }
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDateShort(dateString: string): string {
    if (!dateString || dateString === '0001-01-01T00:00:00Z') {
        return '-';
    }
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

export function formatRelativeTime(dateString: string): string {
    if (!dateString || dateString === '0001-01-01T00:00:00Z') {
        return '-';
    }

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
        // Past
        if (diffMins > -60) return `${Math.abs(diffMins)}m ago`;
        if (diffHours > -24) return `${Math.abs(diffHours)}h ago`;
        return `${Math.abs(diffDays)}d ago`;
    } else {
        // Future
        if (diffMins < 60) return `in ${diffMins}m`;
        if (diffHours < 24) return `in ${diffHours}h`;
        return `in ${diffDays}d`;
    }
}

export function shortenAddress(address: string, chars = 6): string {
    if (!address) return '';
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function shortenId(id: string, prefixChars = 8, suffixChars = 4): string {
    if (!id) return '';
    if (id.length <= prefixChars + suffixChars) return id;
    return `${id.slice(0, prefixChars)}...${id.slice(-suffixChars)}`;
}

export function calculateVoteProgress(approve: number, reject: number): number {
    const total = approve + reject;
    if (total === 0) return 0;
    return Math.round((approve / total) * 100);
}

export function isVotingExpired(votingEnd: string): boolean {
    if (!votingEnd || votingEnd === '0001-01-01T00:00:00Z') {
        return false;
    }
    return new Date(votingEnd) < new Date();
}

export function getTimeRemaining(endDate: string): { days: number; hours: number; minutes: number; expired: boolean } {
    if (!endDate || endDate === '0001-01-01T00:00:00Z') {
        return { days: 0, hours: 0, minutes: 0, expired: true };
    }

    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) {
        return { days: 0, hours: 0, minutes: 0, expired: true };
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, expired: false };
}

// Copy to clipboard with fallback
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    } catch {
        return false;
    }
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
