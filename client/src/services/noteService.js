import http from '../api/http';

export async function fetchNotes() {
  const { data } = await http.get('/notes');
  return data.notes;
}

export async function createNote(payload) {
  const { data } = await http.post('/notes', payload);
  return data.note;
}

export async function updateNote(id, payload) {
  const { data } = await http.put(`/notes/${id}`, payload);
  return data.note;
}

export async function deleteNote(id) {
  const { data } = await http.delete(`/notes/${id}`);
  return data.message;
}
