import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Calendar, AlertCircle, Tag, ChevronDown, MoreHorizontal, List as ListIcon, ListFilter } from 'lucide-react';
import TaskDetailModal from '../components/TaskDetailModal';
import Swal from 'sweetalert2';
import { useAppDispatch, useAppSelector } from '../stores/hooks';
import { fetchBoardById, fetchUserBoards, updateBoard } from '../stores/slices/boardSlice';
import { fetchListsByBoard, createList, updateList, deleteList } from '../stores/slices/listSlice';
import { fetchTasksByList, createTask } from '../stores/slices/taskSlice';

interface Card {
  id: string;
  title: string;
  status?: string;
  isCompleted?: boolean;
}

interface List {
  id: string;
  title: string;
  cards: Card[];
}

interface BoardItem {
  id: string;
  title: string;
  backdrop?: string;
  isStarred?: boolean;
}

const Board: React.FC = () => {
  const navigate = useNavigate();
  const { boardId, taskId } = useParams();
  const dispatch = useAppDispatch();
  
  const { currentBoard, boards: allBoards } = useAppSelector((state: any) => state.boards);
  const { lists: reduxLists } = useAppSelector((state: any) => state.lists);
  const { tasks: reduxTasks } = useAppSelector((state: any) => state.tasks);

  const [lists, setLists] = useState<List[]>([]);
  const [yourBoards, setYourBoards] = useState<BoardItem[]>([]);
  const [boardTitle, setBoardTitle] = useState<string>('');
  const [boardStarred, setBoardStarred] = useState<boolean>(false);

  const [showAddCard, setShowAddCard] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [cardTitleError, setCardTitleError] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [markedComplete, setMarkedComplete] = useState(false);
  const [notMarkedComplete, setNotMarkedComplete] = useState(false);
  const [noDates, setNoDates] = useState(false);
  const [overdue, setOverdue] = useState(false);
  const [dueNextDay, setDueNextDay] = useState(false);
  const [noLabels, setNoLabels] = useState(false);
  const [greenLabel, setGreenLabel] = useState(false);
  const [yellowLabel, setYellowLabel] = useState(false);
  const [orangeLabel, setOrangeLabel] = useState(false);
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [editingListTitleId, setEditingListTitleId] = useState<string | null>(null);
  const [editingListTitleValue, setEditingListTitleValue] = useState('');
  const [listTitleError, setListTitleError] = useState('');
  const [currentFilter, setCurrentFilter] = useState<'all' | 'starred' | 'closed'>('all');

  useEffect(() => {
    if (!boardId) return;
    
    dispatch(fetchUserBoards());
    dispatch(fetchBoardById(Number(boardId)));
    dispatch(fetchListsByBoard(Number(boardId)));
  }, [boardId, dispatch]);

  useEffect(() => {
    if (currentBoard) {
      setBoardTitle(currentBoard.title);
      setBoardStarred(!!currentBoard.is_starred);
    }
  }, [currentBoard]);

  useEffect(() => {
    setYourBoards(allBoards.map((x: any) => ({ 
      id: String(x.id!), 
      title: x.title, 
      backdrop: x.backdrop, 
      isStarred: !!x.is_starred 
    })));
  }, [allBoards]);

  useEffect(() => {
    if (reduxLists.length === 0) {
      setLists([]);
      return;
    }

    const transformLists = async () => {
      const taskPromises = reduxLists.map((l: any) => 
        dispatch(fetchTasksByList(Number(l.id!)))
      );
      await Promise.all(taskPromises);

      const full: List[] = reduxLists.map((l: any) => {
          const tasks = reduxTasks.filter((t: any) => t.list_id === l.id);
        return {
          id: String(l.id!),
          title: l.title,
          cards: tasks.map((t: any) => ({ 
            id: String(t.id!), 
            title: t.title, 
            status: t.status,
            isCompleted: t.status === 'DONE'
          }))
        };
      });
      
      setLists(full);
    };
    
    transformLists();
  }, [reduxLists, dispatch]); 
  useEffect(() => {
    if (reduxLists.length === 0) return;

    const full: List[] = reduxLists.map((l: any) => {
          const tasks = reduxTasks.filter((t: any) => t.list_id === l.id);
      return {
        id: String(l.id!),
        title: l.title,
        cards: tasks.map((t: any) => ({ 
          id: String(t.id!), 
          title: t.title, 
          status: t.status,
          isCompleted: t.status === 'DONE'
        }))
      };
    });
    
    setLists(full);
  }, [reduxTasks, reduxLists]);

  useEffect(() => {
    if (boardId && !taskId) {
      reduxLists.forEach((list: any) => {
        dispatch(fetchTasksByList(Number(list.id)));
      });
    }
  }, [taskId, boardId, reduxLists, dispatch]);

  const toggleStar = async () => {
    if (!boardId) return;
    const next = !boardStarred;
    dispatch(updateBoard({ boardId: Number(boardId), data: { is_starred: next } }));
    setBoardStarred(next);
  };

  const closeBoard = async () => {
    if (!boardId) return;
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#DD3333',
      confirmButtonText: 'Yes, close it!',
      cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
      dispatch(updateBoard({ boardId: Number(boardId), data: { is_closed: true } }));
      navigate('/dashboard');
    }
  };

  const handleAddCard = async (listId: string) => {
    if (!validateCardTitle(newCardTitle)) return;
    
    dispatch(createTask({ 
      list_id: Number(listId), 
      title: newCardTitle.trim()
    }));
    setNewCardTitle('');
    setShowAddCard(null);
    setCardTitleError('');
  };

  const validateCardTitle = (title: string) => {
    if (!title.trim()) {
      setCardTitleError('Tên task không được để trống');
      return false;
    }
    setCardTitleError('');
    return true;
  };

  const openCreateList = () => {
    setShowAddList(true);
    setNewListTitle('');
  };

  const handleFilterChange = (filter: 'all' | 'starred' | 'closed') => {
    setCurrentFilter(filter);
  };

  const handleAddList = async () => {
    if (!validateListTitle(newListTitle)) return;
    
    const trimmedTitle = newListTitle.trim();
    dispatch(createList({ 
      board_id: Number(boardId!), 
      title: trimmedTitle
    }));
    setNewListTitle('');
    setShowAddList(false);
    setListTitleError('');
  };

  const cancelAddList = () => {
    setShowAddList(false);
    setNewListTitle('');
    setListTitleError('');
  };

  const startEditListTitle = (listId: string, currentTitle: string) => {
    setEditingListTitleId(listId);
    setEditingListTitleValue(currentTitle);
  };

  const saveEditListTitle = async (listId: string) => {
    if (!validateListTitle(editingListTitleValue, listId)) return;
    
    const trimmedTitle = editingListTitleValue.trim();
    dispatch(updateList({ listId: Number(listId), data: { title: trimmedTitle } }));
    setEditingListTitleId(null);
    setEditingListTitleValue('');
    setListTitleError('');
  };

  const cancelEditListTitle = () => {
    setEditingListTitleId(null);
    setEditingListTitleValue('');
    setListTitleError('');
  };

  const validateListTitle = (title: string, currentListId?: string) => {
    if (!title.trim()) {
      setListTitleError('Tên list không được để trống');
      return false;
    }
    
    const trimmedTitle = title.trim();
    const isDuplicate = lists.some(list => 
      list.title.toLowerCase() === trimmedTitle.toLowerCase() && 
      list.id !== currentListId
    );
    
    if (isDuplicate) {
      setListTitleError('Tên list đã tồn tại');
      return false;
    }
    
    setListTitleError('');
    return true;
  };

  const confirmDeleteList = async (listId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#DD3333',
      confirmButtonText: 'Yes, close it!',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      dispatch(deleteList(Number(listId)));
      await Swal.fire('Đã xóa!', 'Danh sách đã được xóa.', 'success');
    }
  };

  const handleOpenTask = (cardId: string) => {
    const targetBoardId = boardId ?? 'default';
    navigate(`/board/${targetBoardId}/${cardId}`);
  };

  const selectedCard = useMemo(() => {
    if (!taskId) return null;
    for (const list of lists) {
      const found = list.cards.find((c) => c.id === taskId);
      if (found) return { card: found, listTitle: list.title };
    }
    return null;
  }, [taskId, lists]);

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
        <div className="w-70 bg-gray-50 border-r border-gray-200">
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
                  <span className="text-2xl w-5 h-5 flex justify-center items-center"><ListIcon size={32}/></span>
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

          {/* Your boards */}
          <div className="px-2 pb-6 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-sm font-semibold text-gray-800">Your boards</h3>
              <button className="text-gray-500 hover:text-gray-700 text-xl">+</button>
            </div>
            <div className="space-y-1">
              {yourBoards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/board/${b.id}`)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors ${String(b.id) === String(boardId) ? 'bg-gray-200' : ''}`}
                >
                  <div className="w-6 h-6 rounded" style={{ backgroundImage: b.backdrop ? `url(${b.backdrop})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#d1d5db' }}></div>
                  <span className="text-sm text-gray-800 truncate">{b.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="flex flex-col min-h-full">
            {/* Board Header */}
            <div className="bg-gray-100 border-b border-gray-200 px-6 py-4 w-full">
              <div className="flex items-center">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-bold text-gray-800">
                    {boardTitle || 'Board'}
                  </h1>
                  <button onClick={toggleStar} className={`p-1 rounded transition-colors ${boardStarred ? 'text-yellow-500' : 'text-gray-600 hover:text-gray-800'}`} aria-label="Star board">
                    <span className="text-xl">{boardStarred ? '★' : '☆'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-medium">
                    <span>⊞</span>
                    Board 
                  </button>
                  <button className="px-4 py-2 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-bold">
                    <span>☰</span>
                    Table
                  </button>
                  <button className="px-4 py-2 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-bold" onClick={closeBoard}>
                    <span className="text-base border-2 w-5 h-5 pb-[1px] flex justify-center items-center">✕</span>
                    <span className="font-bold">Close this board</span>
                  </button>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors flex gap-2 text-sm font-bold"
                  >
                    <span className='py-0.5'><ListFilter size={16} /></span>
                    Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Board Content */}
            <div className="flex-1 overflow-x-auto p-6">
              <div className="flex gap-4 h-full items-start">
            {/* Lists */}
            {lists.map((list) => (
              <div
                key={list.id}
                className="w-72 flex-shrink-0 bg-gray-100 rounded-lg border border-gray-200 p-3 flex flex-col"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              >
                {/* List Header */}
                <div className="flex items-center justify-between mb-3">
                  {editingListTitleId === list.id ? (
                    <div className="flex-1 mr-2">
                      <input
                        type="text"
                        value={editingListTitleValue}
                        onChange={(e) => {
                          setEditingListTitleValue(e.target.value);
                          setListTitleError('');
                        }}
                        className={`font-semibold text-gray-800 text-sm bg-white border rounded px-2 py-1 outline-none w-full focus:ring-2 ${
                          listTitleError 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        autoFocus
                        onBlur={() => saveEditListTitle(list.id)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            saveEditListTitle(list.id);
                          } else if (e.key === 'Escape') {
                            cancelEditListTitle();
                          }
                        }}
                      />
                      {listTitleError && (
                        <p className="text-red-500 text-xs mt-1">{listTitleError}</p>
                      )}
                    </div>
                  ) : (
                    <h2 
                      className="font-semibold text-gray-800 text-sm cursor-pointer hover:bg-gray-200 px-2 py-1 rounded flex-1"
                      onClick={() => startEditListTitle(list.id, list.title)}
                    >
                      {list.title}
                    </h2>
                  )}
                  <button
                    className="text-gray-500 hover:text-gray-700 p-1"
                    onClick={() => confirmDeleteList(list.id)}
                    aria-label="Delete list"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                  {list.cards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-white rounded border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleOpenTask(card.id)}
                    >
                      <div className="flex items-start gap-2">
                        {card.isCompleted && (
                          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <span className={`text-sm ${card.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {card.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Card */}
                {showAddCard === list.id ? (
                  <div className="bg-gray-100 rounded-lg border border-gray-200 p-3">
                    <input
                      type="text"
                      value={newCardTitle}
                      onChange={(e) => {
                        setNewCardTitle(e.target.value);
                        setCardTitleError('');
                      }}
                      placeholder="Enter a title or paste a link"
                      className={`w-full p-2 text-sm bg-white border rounded focus:outline-none focus:ring-2 mb-3 ${
                        cardTitleError 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCard(list.id)}
                    />
                    {cardTitleError && (
                      <p className="text-red-500 text-xs mb-3">{cardTitleError}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddCard(list.id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Add card
                      </button>
                      <button
                        onClick={() => {
                          setShowAddCard(null);
                          setNewCardTitle('');
                          setCardTitleError('');
                        }}
                        className="text-gray-600 hover:text-gray-800 text-xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors w-full text-sm"
                    onClick={() => setShowAddCard(list.id)}
                  >
                    <span>+</span>
                    <span>Add a card</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); confirmDeleteList(list.id); }}
                      className="ml-auto text-gray-400 hover:text-red-600"
                      aria-label="Delete list"
                      title="Delete list"
                    >
                      ⎘
                    </button>
                  </button>
                )}
                
              </div>
            ))}

            {/* Add Another List */}
            <div className="w-72 flex-shrink-0">
              {showAddList ? (
                <div className="bg-gray-100 rounded-lg border border-gray-200 p-3">
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => {
                      setNewListTitle(e.target.value);
                      setListTitleError('');
                    }}
                    placeholder="Enter list name..."
                    className={`w-full p-2 text-sm bg-white border rounded focus:outline-none focus:ring-2 mb-3 ${
                      listTitleError 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
                  />
                  {listTitleError && (
                    <p className="text-red-500 text-xs mb-3">{listTitleError}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddList}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Add list
                    </button>
                    <button
                      onClick={cancelAddList}
                      className="text-gray-600 hover:text-gray-800 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={openCreateList} className="w-full bg-gray-100 hover:bg-gray-50 text-gray-700 rounded-lg p-3 flex items-center gap-2 transition-colors border border-gray-200">
                  <span>+</span>
                  <span className="font-medium text-sm">Add another list</span>
                </button>
              )}
            </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-center relative p-3">
              <h2 className="text-sm text-gray-600 font-bold">Filter</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Keyword */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Keyword
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Enter a keyword..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
                <p className="text-xs text-gray-500 mt-1">Search cards</p>
              </div>

              {/* Card Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Card status
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={markedComplete}
                      onChange={(e) => setMarkedComplete(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Marked as complete</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notMarkedComplete}
                      onChange={(e) => setNotMarkedComplete(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Not marked as complete</span>
                  </label>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Due date
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noDates}
                      onChange={(e) => setNoDates(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className='w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0'>
                      <Calendar size={12} className="text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-800">No dates</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overdue}
                      onChange={(e) => setOverdue(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle size={12} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-gray-700">Overdue</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dueNextDay}
                      onChange={(e) => setDueNextDay(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle size={12} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-gray-700">Due in the next day</span>
                  </label>
                </div>
              </div>

              {/* Labels */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Labels
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noLabels}
                      onChange={(e) => setNoLabels(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <Tag size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">No labels</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={greenLabel}
                      onChange={(e) => setGreenLabel(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 h-8 bg-green-400 rounded"></div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={yellowLabel}
                      onChange={(e) => setYellowLabel(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 h-8 bg-yellow-300 rounded"></div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={orangeLabel}
                      onChange={(e) => setOrangeLabel(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 h-8 bg-orange-400 rounded"></div>
                  </label>
                  <button className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm">
                    <span>Select labels</span>
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {taskId && (
        <TaskDetailModal 
          listTitle={selectedCard?.listTitle}
        />
      )}
    </div>
  );
};

export default Board;