import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: BoardData) => void;
}

interface BoardData {
  title: string;
  background?: string;
  color?: string;
}

const backgrounds = [
  { id: 'bg1', image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400' },
  { id: 'bg2', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
  { id: 'bg3', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400' },
  { id: 'bg4', image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400' }
];

const colors = [
  { id: 'orange', value: '#FF6B00' },
  { id: 'purple', value: '#7B2CBF' },
  { id: 'green', value: '#00E676' },
  { id: 'cyan', value: '#00B8D4' },
  { id: 'yellow', value: '#FFD600' },
  { id: 'pink', value: '#E91E63' }
];

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [selectedBg, setSelectedBg] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!title.trim()) {
      setError('👋 Please provide a valid board title');
      return;
    }

    onCreate({
      title: title.trim(),
      background: selectedBg,
      color: selectedColor
    });

    // Reset form
    setTitle('');
    setSelectedBg('');
    setSelectedColor('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setSelectedBg('');
    setSelectedColor('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative border-gray-400">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Create board</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-red-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Background Section */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-3">Background</h3>
          <div className="grid grid-cols-4 gap-2">
            {backgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedBg(bg.image)}
                className="relative aspect-video rounded-lg overflow-hidden border-2 transition"
                style={{
                  borderColor: selectedBg === bg.image ? '#0066FF' : 'transparent'
                }}
              >
                <img
                  src={bg.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {selectedBg === bg.image && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Color Section */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-3">Color</h3>
          <div className="grid grid-cols-6 gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id)}
                className="aspect-video rounded-lg transition relative"
                style={{ backgroundColor: color.value }}
              >
                {selectedColor === color.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Board Title Section */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-base font-medium">Board title </span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            placeholder="E.g. Shopping list for birthday..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && (
            <p className="mt-2 text-sm text-gray-600">{error}</p>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition"
          >
            Close
          </button>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;