import React, { useEffect, useState } from 'react';
import CreateBoardModal from '../components/CreateBoardModal';
import UpdateBoardModal from '../components/UpdateBoardModal';
import { Settings, Tag } from 'lucide-react';
import { signOut } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../stores/hooks';
import { fetchUserBoards, createBoard, updateBoard, deleteBoard } from '../stores/slices/boardSlice';
import { clearUser } from '../stores/slices/userSlice';
import { getCurrentUser } from '../utils/auth';
import {List} from 'lucide-react'

interface Board {
  id: string;
  title: string;
  image: string;
  isStarred?: boolean;
  isClosed?: boolean;
  color?: string;
  background?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { boards: reduxBoards } = useAppSelector((state) => state.boards);
  
  const [currentFilter, setCurrentFilter] = useState<'all' | 'starred' | 'closed'>('all');

  const boards = reduxBoards
    .filter(b => !b.is_starred && !b.is_closed)
    .map(b => ({
      id: String(b.id!),
      title: b.title,
      image: b.backdrop || '',
      isStarred: !!b.is_starred,
      isClosed: !!b.is_closed,
      color: undefined,
      background: b.backdrop
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const starredBoards = reduxBoards
    .filter(b => b.is_starred && !b.is_closed)
    .map(b => ({
      id: String(b.id!),
      title: b.title,
      image: b.backdrop || '',
      isStarred: !!b.is_starred,
      isClosed: !!b.is_closed,
      color: undefined,
      background: b.backdrop
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const closedBoards = reduxBoards
    .filter(b => b.is_closed)
    .map(b => ({
      id: String(b.id!),
      title: b.title,
      image: b.backdrop || '',
      isStarred: !!b.is_starred,
      isClosed: !!b.is_closed,
      color: undefined,
      background: b.backdrop
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  useEffect(() => {
    dispatch(fetchUserBoards());
  }, [dispatch]);

  useEffect(() => {
    console.log('Boards updated:', reduxBoards.length);
  }, [reduxBoards]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  const handleOpenCreate = () => setIsCreateOpen(true);
  const handleCloseCreate = () => setIsCreateOpen(false);

  const handleOpenUpdate = (board: Board) => {
    setSelectedBoard(board);
    setIsUpdateOpen(true);
  };
  const handleCloseUpdate = () => {
    setSelectedBoard(null);
    setIsUpdateOpen(false);
  };

  const handleOpenDelete = (board: Board) => {
    setSelectedBoard(board);
    setIsDeleteOpen(true);
  };
  const handleCloseDelete = () => {
    setSelectedBoard(null);
    setIsDeleteOpen(false);
  };

  const handleCreateBoard = async (data: { title: string; background?: string; color?: string }) => {
    try {
      await dispatch(createBoard({ 
        title: data.title, 
        backdrop: data.background
      })).unwrap();
      dispatch(fetchUserBoards());
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleUpdateBoard = async (data: { title: string; background?: string; color?: string }) => {
    if (!selectedBoard) return;
    try {
      await dispatch(updateBoard({ 
        boardId: Number(selectedBoard.id), 
        data: { 
          title: data.title, 
          backdrop: data.background 
        } 
      })).unwrap();
      dispatch(fetchUserBoards());
    } catch (error) {
      console.error('Error updating board:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBoard) return;
    try {
      await dispatch(deleteBoard(Number(selectedBoard.id))).unwrap();
      setSelectedBoard(null);
      setIsDeleteOpen(false);
      dispatch(fetchUserBoards());
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  const handleFilterChange = (filter: 'all' | 'starred' | 'closed') => {
    setCurrentFilter(filter);
  };

  const getDisplayBoards = () => {
    switch (currentFilter) {
      case 'starred':
        return starredBoards;
      case 'closed':
        return closedBoards;
      default:
        return boards;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="5" height="14" rx="1" fill="white"/>
                <rect x="10" y="1" width="5" height="8" rx="1" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800">Trello</span>
          </div>
        </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-70 bg-gray-50 border-r border-gray-200 ">
          {/* Navigation */}
          <div className="flex-1 px-2 py-3">
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 px-2">
                Your Workspaces
              </h3>
              <nav className="space-y-1">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded transition-colors text-left ${
                    currentFilter === 'all' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl w-5 h-5 flex justify-center items-center"><List size={32}/></span>
                  <span className="font-medium">Boards</span>
                </button>
                <button
                  onClick={() => handleFilterChange('starred')}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded transition-colors text-left ${
                    currentFilter === 'starred' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl w-5 h-5 pb-1 flex justify-center items-center">☆</span>
                  <span className="font-medium">Starred Boards</span>
                </button>
                <button
                  onClick={() => handleFilterChange('closed')}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded transition-colors text-left ${
                    currentFilter === 'closed' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base border-2 w-5 h-5 pb-[1px] rounded flex justify-center items-center">✕</span>
                  <span className="font-medium">Closed Boards</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="px-1 pb-6 border-t border-gray-200 pt-4 space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2 text-blue-600 rounded hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </a>
            <button
              onClick={() => { 
                signOut(); 
                dispatch(clearUser());
                navigate('/signin', { replace: true }); 
              }}
              className="w-full text-left flex items-center gap-3 px-3 py-2 text-blue-600 rounded hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="max-w-7xl mx-auto px-8 py-6">
            {/* Content Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
                <div className='mt-1'><List size={28}/></div> 
                <div>Your Workspaces</div>
              </h1>
              <div className="flex items-center">
                <button className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-400 rounded-tl-sm rounded-bl-sm hover:bg-gray-50 transition-colors">
                  Share
                </button>
                <button className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-400 rounded-tr-sm rounded-br-sm hover:bg-gray-50 transition-colors">
                  Export
                </button>
                <button className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-400 rounded hover:bg-gray-50 transition-colors flex items-center gap-2 ml-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  This week
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 9L2 5h8z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Boards Grid */}
            <div className="grid grid-cols-4 gap-5 mb-6">
              {getDisplayBoards().map((board) => (
                <div
                  key={board.id}
                  className="relative h-36 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  style={{
                    backgroundImage: board.image ? `url("${board.image}")` : undefined,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundColor: board.image ? undefined : '#d1d5db'
                  }}
                  onClick={() => navigate(`/board/${board.id}`)}
                >
                  <div className="absolute inset-0 transition-all group-hover:bg-black/5" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <h3 className="text-white font-semibold text-lg drop-shadow">
                      {board.title}
                    </h3>
                    <div className="flex items-center gap-4 opacity-0 group-hover:!opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenUpdate(board); }}
                        className="px-3 py-2 bg-[#2C3E5D] rounded text-white text-sm font-medium hover:bg-blue-900 transition-all flex items-center gap-2 shadow"
                      >
                          <Tag  className="w-4 h-4" />
                          Edit this board
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenDelete(board); }}
                        className="px-3 py-2 bg-red-600 rounded text-white text-sm font-medium hover:bg-red-700 transition-all flex items-center gap-2 shadow"
                      >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/>
                            <path d="M14 11v6"/>
                          </svg>
                          Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {/* Create New Board */}
              {currentFilter !== 'closed' && (
              <div className="mb-12 w-70 h-36 bg-gray-200 rounded-xl">
                <div className='flex justify-center py-13'>
                  <button onClick={handleOpenCreate} className="px-5 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-600 text-base font-normal hover:border-gray-400 hover:bg-gray-50 transition-colors">
                    Create new board
                  </button>
                </div>
              </div>
            )}
            </div>

            {/* Starred Boards */}
            {currentFilter === 'all' && starredBoards.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-2xl">☆</span> Starred Boards
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {starredBoards.map((board) => (
                    <div
                      key={board.id}
                      className="relative h-36 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => navigate(`/board/${board.id}`)}
                      style={{
                        backgroundImage: board.image ? `url("${board.image}")` : undefined,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundColor: board.image ? undefined : '#000'
                      }}
                    >
                      <div className="absolute inset-0 transition-all group-hover:bg-black/5" />
                      <div className="absolute inset-0 p-4 flex flex-col justify-between">
                        <h3 className="text-white font-semibold text-lg">
                          {board.title}
                        </h3>
                        <div className="flex items-center gap-4 opacity-0 group-hover:!opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenUpdate(board); }}
                            className="px-3 py-2 bg-[#2C3E5D] rounded text-white text-sm font-medium hover:bg-blue-800 transition-all flex items-center gap-2 shadow"
                          >
                              <Tag className="w-4 h-4" />
                              Edit this board
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenDelete(board); }}
                            className="px-3 py-2 bg-red-600 rounded text-white text-sm font-medium hover:bg-red-700 transition-all flex items-center gap-2 shadow"
                          >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6"/>
                                <path d="M14 11v6"/>
                              </svg>
                              Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modals */}
      <CreateBoardModal
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
        onCreate={(data) => {
          handleCreateBoard(data);
        }}
      />
      <UpdateBoardModal
        isOpen={isUpdateOpen}
        onClose={handleCloseUpdate}
        initialData={selectedBoard ? { title: selectedBoard.title, background: selectedBoard.image, color: selectedBoard.color } : undefined}
        onUpdate={(data) => {
          handleUpdateBoard(data);
        }}
      />
      {isDeleteOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Xóa board?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc muốn xóa board "{selectedBoard?.title}"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseDelete}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;