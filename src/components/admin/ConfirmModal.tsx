import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white max-w-md w-full p-6 shadow-xl border border-brand-divider">
        <h3 className="text-xl font-display mb-2">{title}</h3>
        <p className="text-brand-secondary font-sans mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-brand-divider hover:bg-brand-bg transition-colors font-sans text-sm tracking-widest uppercase"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-brand-black text-white hover:bg-brand-secondary transition-colors font-sans text-sm tracking-widest uppercase"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
