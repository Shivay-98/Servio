import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, logout } from '../redux/slices/authSlice';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogin = async (data) => {
    const res = await authService.login(data);
    dispatch(setCredentials({ user: res.data.user, token: res.data.accessToken }));
    return res;
  };

  const handleRegister = async (data) => {
    const res = await authService.register(data);
    dispatch(setCredentials({ user: res.data.user, token: res.data.accessToken }));
    return res;
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // continue
    }
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully');
  };

  return {
    user,
    token,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}

export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  return isAuthenticated;
}
