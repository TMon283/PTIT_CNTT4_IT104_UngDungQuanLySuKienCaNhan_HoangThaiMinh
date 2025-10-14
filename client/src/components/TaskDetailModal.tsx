import { useEffect, useState } from 'react';
import { X, Tag, Minus, Bold, Italic, List, Link, Image, Plus, Sparkles, Paperclip, Type, Clock, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../stores/hooks';
import { fetchTaskById, updateTask, deleteTask } from '../stores/slices/taskSlice';
import Swal from 'sweetalert2';

interface TaskDetailModalProps {
  listTitle?: string;
}

export default function TaskDetailModal({}: TaskDetailModalProps) {
  const navigate = useNavigate();
  const { boardId, taskId } = useParams();
  const dispatch = useAppDispatch();
  const { currentTask, loading } = useAppSelector((state) => state.tasks);
  
  const [isOpen, setIsOpen] = useState(true);
  const [taskTitle, setTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('IN-PROGRESS');
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!taskId) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      dispatch(fetchTaskById(Number(taskId)));
    }
  }, [taskId, dispatch]);

  useEffect(() => {
    if (currentTask) {
      setTaskTitle(currentTask.title || '');
      setDescription(currentTask.description || '');
      setStatus(currentTask.status || 'IN-PROGRESS');
      setIsCompleted(currentTask.status === 'DONE');
      setHasChanges(false);
    }
  }, [currentTask]);

  useEffect(() => {
    if (hasChanges && taskId && taskTitle.trim()) {
      const timeoutId = setTimeout(() => {
        handleSaveTask(false); 
      }, 1000); 

      return () => clearTimeout(timeoutId);
    }
  }, [taskTitle, hasChanges, taskId]);

  const handleCompleteTask = async () => {
    if (!taskId) return;
    
    const newStatus = isCompleted ? 'IN-PROGRESS' : 'DONE';
    const newIsCompleted = !isCompleted;
    
    try {
      await dispatch(updateTask({ 
        taskId: Number(taskId), 
        data: { status: newStatus }
      })).unwrap();
      setIsCompleted(newIsCompleted);
      setStatus(newStatus);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskId) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#DD3333',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteTask(Number(taskId))).unwrap();
        navigate(`/board/${boardId}`);
      } catch (error) {
        console.error('Failed to delete task:', error);
        Swal.fire('Error', 'Failed to delete task', 'error');
      }
    }
  };

  const handleSaveTask = async (showMessage = true) => {
    if (!taskId) return;

    try {
      await dispatch(updateTask({ 
        taskId: Number(taskId), 
        data: {
          title: taskTitle,
          description: description,
          status: status
        }
      })).unwrap();
      setHasChanges(false);
      if (showMessage) {
        Swal.fire('Success', 'Task has been updated', 'success');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      if (showMessage) {
        Swal.fire('Error', 'Failed to update task', 'error');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/20 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 p-6">
          <div className="flex items-center gap-3 flex-1">
            <button 
              onClick={handleCompleteTask}
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mb-6 flex items-center justify-center transition-colors ${
                isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-500 hover:border-green-500'
              }`}
            >
              {isCompleted && <Check size={12} />}
            </button>
            <div className="flex-1">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => {
                  setTaskTitle(e.target.value);
                  setHasChanges(true);
                }}
                className="text-xl font-normal text-gray-900 bg-transparent border-none outline-none w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent px-2 py-1 rounded"
                placeholder="Nhập tên task..."
                autoFocus
              />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">in list</span>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded border-none outline-none cursor-pointer"
                >
                  <option value="TODO">TODO</option>
                  <option value="IN-PROGRESS">IN-PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate(`/board/${boardId ?? ''}`)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-start gap-2 mb-4">
              <div className="flex items-center gap-2 text-gray-700 min-w-0">
                <List size={20} className="flex-shrink-0" />
                <span className="font-medium">Description</span>
              </div>
            </div>

            {/* Editor Toolbar */}
            <div className="border border-gray-300 rounded-lg mb-4">
              <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                <select className="text-sm px-2 py-1 border-none bg-transparent cursor-pointer">
                  <option>Aa</option>
                  <option>Heading 1</option>
                  <option>Heading 2</option>
                </select>
                
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                
                <button className="p-1.5 hover:bg-gray-200 rounded">
                  <Bold size={18} />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded">
                  <Italic size={18} />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded">
                  <Type size={18} className="line-through" />
                </button>
                
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                
                <button className="p-1.5 hover:bg-gray-200 rounded flex items-center gap-1">
                  <List size={18} />
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>
                
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                
                <button className="p-1.5 hover:bg-gray-200 rounded">
                  <Link size={18} />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded">
                  <Image size={18} />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded flex items-center gap-1">
                  <Plus size={18} />
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>
                
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                
                <button className="p-1.5 hover:bg-gray-200 rounded">
                  <Sparkles size={18} />
                </button>
                
                <div className="flex-1"></div>
                
                <button className="p-1.5 hover:bg-gray-200 rounded">
                  <Paperclip size={18} />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded">
                  <Type size={18} />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>

              {/* Text Area */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 min-h-[240px] border-none outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => handleSaveTask(true)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Đang lưu...' : 'Save'}
              </button>
              <button 
                onClick={() => navigate(`/board/${boardId}`)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-64 p-4 flex flex-col gap-2">
            <button className="flex items-center gap-3 px-3 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded text-left w-full">
              <Tag size={18} />
              <span className="text-sm font-medium">Labels</span>
            </button>
            
            <button className="flex items-center gap-3 px-3 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded text-left w-full">
              <Clock size={18} />
              <span className="text-sm font-medium">Dates</span>
            </button>
            
            <button 
              onClick={handleDeleteTask}
              className="flex items-center gap-3 px-3 py-2 text-white bg-red-700 hover:bg-red-800 rounded text-left w-full"
            >
              <Minus size={18} />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}