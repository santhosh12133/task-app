import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../ui/Button';
import Card from '../ui/Card';
import FieldError from '../ui/FieldError';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Badge from '../ui/Badge';
import { parseNaturalLanguageTask } from '../../services/aiService';
import { getErrorMessage } from '../../utils/error';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
});

export default function TaskComposer({ defaultValues, onSubmit, onParse }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      priority: 'medium',
      category: 'general',
      dueDate: '',
      tags: '',
    },
  });

  const tagsValue = useWatch({
    control: form.control,
    name: 'tags',
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  async function handleNaturalLanguage() {
    const currentTitle = form.getValues('title');
    const currentDescription = form.getValues('description');
    const sourceText = [currentTitle, currentDescription].filter(Boolean).join(' ');
    if (!sourceText.trim()) {
      setAiError('Enter a short task request before using AI parse.');
      return;
    }

    try {
      setAiLoading(true);
      setAiError('');
      const parsed = await parseNaturalLanguageTask(sourceText);
      onParse?.(parsed);
    } catch (error) {
      setAiError(getErrorMessage(error, 'AI parsing is unavailable right now.'));
    } finally {
      setAiLoading(false);
    }
  }

  const tagPreview = useMemo(() => {
    const raw = tagsValue || '';
    return raw.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 4);
  }, [tagsValue]);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Create task</p>
          <h3 className="mt-2 text-2xl font-black text-text">Build something meaningful</h3>
        </div>
        <Button variant="secondary" onClick={handleNaturalLanguage} disabled={aiLoading}>
          {aiLoading ? 'Parsing...' : 'AI Parse'}
        </Button>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          const success = await onSubmit(values);
          if (success) {
            form.reset({
              title: '',
              description: '',
              priority: 'medium',
              category: 'general',
              dueDate: '',
              tags: '',
            });
          }
        })}
      >
        <div className="space-y-2">
          <Input aria-label="Task title" placeholder="Prepare for MCA exam" {...form.register('title')} />
          <FieldError message={form.formState.errors.title?.message} />
        </div>
        <div className="space-y-2">
          <Textarea aria-label="Task description" placeholder="Describe the outcome, constraints, or any sub-steps" {...form.register('description')} />
          <FieldError message={form.formState.errors.description?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Select aria-label="Task priority" {...form.register('priority')}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
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
            <Input aria-label="Task tags" placeholder="Tags, comma separated" {...form.register('tags')} />
            <FieldError message={form.formState.errors.tags?.message} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tagPreview.map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
        <FieldError message={aiError} />

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Task'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
