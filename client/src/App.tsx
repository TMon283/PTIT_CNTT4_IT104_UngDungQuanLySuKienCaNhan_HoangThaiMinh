import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './stores';
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import './index.css'
import { isAuthenticated } from './utils/auth';
import { useAppSelector, useAppDispatch } from './stores/hooks';
import { fetchCurrentUser } from './stores/slices/userSlice';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { currentUser } = useAppSelector((state) => state.user);
  
  if (!isAuthenticated() || !currentUser) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    if (isAuthenticated()) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/board/:boardId" element={<ProtectedRoute><Board /></ProtectedRoute>} />
        <Route path="/board/:boardId/:taskId" element={<ProtectedRoute><Board /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
