import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import api from '../lib/api';
import { setUser, clearUser } from '../store/authSlice';
import type { RootState } from '../store';

export function useAuth() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const login = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post('/auth/login', data);
      return res.data.user;
    },
    onSuccess: (user) => {
      dispatch(setUser(user));
    },
  });

  const register = useMutation({
    mutationFn: async (data: { email: string; name: string; password: string }) => {
      const res = await api.post('/auth/register', data);
      return res.data.user;
    },
    onSuccess: (user) => {
      dispatch(setUser(user));
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      dispatch(clearUser());
      queryClient.clear();
    },
  });

  const checkAuth = useMutation({
    mutationFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.user;
    },
    onSuccess: (user) => {
      dispatch(setUser(user));
    },
  });

  return { user, isAuthenticated, login, register, logout, checkAuth };
}
