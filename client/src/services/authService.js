import http from '../api/http';

export async function signUp(payload) {
  const { data } = await http.post('/auth/signup', payload);
  return data;
}

export async function signIn(payload) {
  const { data } = await http.post('/auth/login', payload);
  return data;
}

export async function signInWithGoogle(payload) {
  const { data } = await http.post('/auth/google', payload);
  return data;
}

export async function forgotPassword(payload) {
  const { data } = await http.post('/auth/forgot-password', payload);
  return data;
}

export async function resetPassword(payload) {
  const { data } = await http.post('/auth/reset-password', payload);
  return data;
}

export async function fetchMe() {
  const { data } = await http.get('/auth/me');
  return data.user;
}

export async function updateProfile(payload) {
  const { data } = await http.put('/auth/me', payload);
  return data.user;
}

export async function logout() {
  const { data } = await http.post('/auth/logout');
  return data.message;
}
