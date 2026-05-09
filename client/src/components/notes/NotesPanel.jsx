import { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import FieldError from '../ui/FieldError';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Badge from '../ui/Badge';

export default function NotesPanel({ notes = [], onCreate, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setContent('');
    setError('');
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Add a title before saving the note.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title: title.trim(),
      content: content.trim(),
      markdown: content.trim(),
      tags: [],
    };

    const result = editingId ? await onUpdate(editingId, payload) : await onCreate(payload);

    setSaving(false);
    if (!result) {
      setError(editingId ? 'The note could not be updated.' : 'The note could not be saved.');
      return;
    }

    resetForm();
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Notes</p>
          <h3 className="mt-2 text-2xl font-black text-text">Markdown-ready brain dump</h3>
        </div>
        <Badge tone="blue">Sync enabled</Badge>
      </div>

      <div className="mt-5 space-y-3">
        <Input aria-label="Note title" placeholder="Note title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Textarea aria-label="Note content" placeholder="Capture ideas, meeting notes, or a draft plan" value={content} onChange={(event) => setContent(event.target.value)} />
        <FieldError message={error} />
        <div className="flex justify-end gap-3">
          {editingId ? <Button variant="secondary" onClick={resetForm}>Cancel</Button> : null}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Note' : 'Save Note'}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {notes.length ? notes.map((note) => (
          <div key={note._id} className="rounded-3xl border border-line bg-panel/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-text">{note.title}</h4>
                <p className="mt-1 text-sm leading-6 text-muted">{note.content}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingId(note._id);
                    setTitle(note.title || '');
                    setContent(note.content || '');
                    setError('');
                  }}
                >
                  Edit
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onDelete(note)}>Delete</Button>
              </div>
            </div>
          </div>
        )) : (
          <div className="rounded-3xl border border-dashed border-line bg-panel/40 p-6 text-sm text-muted">
            Notes you save here will appear in this list and stay ready for quick edits.
          </div>
        )}
      </div>
    </Card>
  );
}
