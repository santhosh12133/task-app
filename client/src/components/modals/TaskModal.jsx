import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import Card from '../ui/Card';
import FieldError from '../ui/FieldError';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(['todo', 'in progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  recurring: z.string().optional(),
  tags: z.string().optional(),
});

export default function TaskModal({ task, onSave, onClose }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      priority: task?.priority || 'medium',
      category: task?.category || 'general',
      dueDate: task?.dueDate ? String(task.dueDate).slice(0, 10) : '',
      recurring: task?.recurring || '',
      tags: Array.isArray(task?.tags) ? task.tags.join(', ') : '',
    },
  });

  useEffect(() => {
    form.reset({
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      priority: task?.priority || 'medium',
      category: task?.category || 'general',
      dueDate: task?.dueDate ? String(task.dueDate).slice(0, 10) : '',
      recurring: task?.recurring || '',
      tags: Array.isArray(task?.tags) ? task.tags.join(', ') : '',
    });
  }, [form, task]);

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center" role="presentation">
      <Card className="w-full max-w-2xl border-white/10">
        <div className="flex items-center justify-between gap-4" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Task editor</p>
            <h3 id="task-modal-title" className="mt-2 text-2xl font-black text-text">{task ? 'Edit task' : 'Create task'}</h3>
          </div>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            const success = await onSave({
              ...values,
              tags: values.tags
                ? values.tags.split(',').map((item) => item.trim()).filter(Boolean)
                : [],
            });
            if (!success) {
              return;
            }
          })}
        >
          <div className="space-y-2">
            <Input aria-label="Task title" placeholder="Task title" {...form.register('title')} />
            <FieldError message={form.formState.errors.title?.message} />
          </div>
          <div className="space-y-2">
            <Textarea aria-label="Task description" placeholder="Describe the task, blockers, and context" {...form.register('description')} />
            <FieldError message={form.formState.errors.description?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Select aria-label="Task status" {...form.register('status')}>
                <option value="todo">Todo</option>
                <option value="in progress">In progress</option>
                <option value="done">Done</option>
              </Select>
              <FieldError message={form.formState.errors.status?.message} />
            </div>
            <div className="space-y-2">
              <Select aria-label="Task priority" {...form.register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
              <FieldError message={form.formState.errors.priority?.message} />
            </div>
            <div className="space-y-2">
              <Input aria-label="Task category" placeholder="Category" {...form.register('category')} />
              <FieldError message={form.formState.errors.category?.message} />
            </div>
            <div className="space-y-2">
              <Input aria-label="Task due date" type="date" {...form.register('dueDate')} />
              <FieldError message={form.formState.errors.dueDate?.message} />
            </div>
            <div className="space-y-2">
              <Input aria-label="Recurring schedule" placeholder="Recurring schedule" {...form.register('recurring')} />
              <FieldError message={form.formState.errors.recurring?.message} />
            </div>
            <div className="space-y-2">
              <Input aria-label="Task tags" placeholder="Tags, comma separated" {...form.register('tags')} />
              <FieldError message={form.formState.errors.tags?.message} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
