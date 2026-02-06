import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    onClose: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; icon: React.ReactNode; border: string }> = {
    success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    error: {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        icon: <XCircle className="w-5 h-5 text-rose-600" />,
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
    },
    info: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        icon: <Info className="w-5 h-5 text-indigo-600" />,
    },
};

const Toast: React.FC<ToastProps> = ({ id, type, message, onClose }) => {
    const style = toastStyles[type];

    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 3000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${style.bg} ${style.border} shadow-lg animate-slide-in`}
            role="alert"
        >
            {style.icon}
            <p className="font-medium text-slate-700 flex-1">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="p-1 hover:bg-white/50 rounded-lg transition-colors"
            >
                <X className="w-4 h-4 text-slate-500" />
            </button>
        </div>
    );
};

export default Toast;
