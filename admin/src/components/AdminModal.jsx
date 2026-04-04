import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function AdminModal({ isOpen, title, onClose, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    const maxWidth = sizeClasses[size] || sizeClasses.md;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} overflow-hidden border border-border-light flex flex-col max-h-[90vh]`}
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-bg-light border-b border-border-light p-4 flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-bold text-secondary uppercase">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-primary transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto w-full relative">
                    {children}
                </div>
            </div>
        </div>
    );
}
