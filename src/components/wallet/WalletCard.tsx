import { Wallet, Send, Eye, MoreVertical, Lock, Copy, Check, Info } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, shortenAddress, copyToClipboard, cn } from '../../lib/utils';
import { WALLET_TYPE_LABELS, canTransfer } from '../../lib/constants';
import type { Wallet as WalletType } from '../../types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface WalletCardProps {
    wallet: WalletType;
    onTransfer?: (wallet: WalletType) => void;
    onView?: (wallet: WalletType) => void;
}

const walletStyles: Record<string, { gradient: string; iconBg: string; shadow: string }> = {
    REGULAR: {
        gradient: 'from-blue-600 to-blue-400',
        iconBg: 'bg-blue-500',
        shadow: 'shadow-blue-500/20'
    },
    NODE_WALLET: {
        gradient: 'from-purple-600 to-purple-400',
        iconBg: 'bg-purple-500',
        shadow: 'shadow-purple-500/20'
    },
    NODE: {
        gradient: 'from-purple-600 to-purple-400',
        iconBg: 'bg-purple-500',
        shadow: 'shadow-purple-500/20'
    },
    DEVELOPER: {
        gradient: 'from-emerald-600 to-emerald-400',
        iconBg: 'bg-emerald-500',
        shadow: 'shadow-emerald-500/20'
    },
    OWNER: {
        gradient: 'from-amber-500 to-orange-500',
        iconBg: 'bg-orange-500',
        shadow: 'shadow-orange-500/20'
    },
};

export function WalletCard({ wallet, onTransfer, onView }: WalletCardProps) {
    const [copied, setCopied] = useState(false);
    const walletType = wallet.type || wallet.wallet_type || 'REGULAR';
    const styles = walletStyles[walletType] || walletStyles.REGULAR;
    const isTransferable = canTransfer(walletType);
    const lockedBalance = wallet.locked_balance || 0;

    const handleCopyAddress = async () => {
        const success = await copyToClipboard(wallet.wallet_address);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Card className={cn("group overflow-hidden border-none transition-all duration-300 hover:translate-y-[-4px]", styles.shadow)}>
            <div className={cn("h-32 bg-gradient-to-br p-6 relative", styles.gradient)}>
                {/* Abstract patterns */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5" />

                <div className="relative z-10 flex justify-between items-start text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
                            <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-medium opacity-80 uppercase tracking-widest">
                                {WALLET_TYPE_LABELS[walletType]}
                            </p>
                            <button
                                onClick={handleCopyAddress}
                                className="flex items-center gap-1.5 font-mono text-sm opacity-90 hover:opacity-100 hover:bg-white/10 rounded px-1 -ml-1 py-0.5 transition-all"
                            >
                                {shortenAddress(wallet.wallet_address, 6)}
                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-70" />}
                            </button>
                        </div>
                    </div>

                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                className="min-w-[160px] bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200"
                                sideOffset={5}
                                align="end"
                            >
                                <DropdownMenu.Item
                                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => onView?.(wallet)}
                                >
                                    <Eye className="h-4 w-4 text-gray-400" />
                                    View Details
                                </DropdownMenu.Item>
                                {isTransferable && (
                                    <DropdownMenu.Item
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => onTransfer?.(wallet)}
                                    >
                                        <Send className="h-4 w-4 text-gray-400" />
                                        Transfer Funds
                                    </DropdownMenu.Item>
                                )}
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </div>

            <CardContent className="p-5">
                <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Balance</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">{formatCurrency(wallet.balance)}</span>
                        <span className="text-sm font-medium text-gray-500">ICL</span>
                    </div>

                    {lockedBalance > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                            <Lock className="h-3.5 w-3.5" />
                            <span>{formatCurrency(lockedBalance)} ICL Locked</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Badge variant={wallet.status === 'ACTIVE' ? 'success' : 'warning'} className="text-[10px] px-2 py-0.5">
                        {wallet.status}
                    </Badge>

                    {wallet.node_id && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span className="font-regular">Node:</span>
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{shortenAddress(wallet.node_id, 4)}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-5">
                    {isTransferable ? (
                        <Button
                            className="w-full bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-200"
                            onClick={() => onTransfer?.(wallet)}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Transfer
                        </Button>
                    ) : (
                        <div className="w-full py-2.5 px-3 rounded-lg bg-gray-50 border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
                                <Info className="h-3.5 w-3.5" />
                                {walletType === 'NODE_WALLET' ? 'Node wallets cannot transfer' : 'Transfer disabled'}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
