import React, { useEffect, useState } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
        }, 3000);

        return () => clearTimeout(timer);
    }, [id, onClose]);

    const icons = {
        success: <Check className="w-5 h-5" />,
        error: <X className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const colors = {
        success: 'bg-green-500',
        error: 'bg-rose-500',
        warning: 'bg-amber-500',
        info: 'bg-indigo-500'
    };

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-white shadow-lg transition-all duration-300 ${colors[type]} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                }`}
        >
            {icons[type]}
            <span className="font-bold text-sm">{message}</span>
            <button onClick={() => onClose(id)} className="ml-2 hover:opacity-75">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
