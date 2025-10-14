import React, { useEffect, useState } from 'react';

interface ListModalProps {
  isOpen: boolean;
  initialTitle?: string;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

const ListModal: React.FC<ListModalProps> = ({ isOpen, initialTitle, onClose, onSubmit }) => {
  const [title, setTitle] = useState(initialTitle || '');

  useEffect(() => {
    setTitle(initialTitle || '');
  }, [initialTitle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
        <h3 className="text-lg font-semibold mb-3">{initialTitle ? 'Update list' : 'Create list'}</h3>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="List title"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{initialTitle ? 'Save' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
};

export default ListModal;


