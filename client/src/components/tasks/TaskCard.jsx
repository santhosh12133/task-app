import { memo } from 'react';
import { CheckCircle2, Circle, GripVertical, MoreHorizontal, Sparkles, Tag, Clock3, Trash2 } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatDate } from '../../utils/date';

function priorityTone(priority) {
  if (priority === 'high') return 'danger';
  if (priority === 'medium') return 'warning';
  return 'neutral';
}

function TaskCard({ task, index, onEdit, onToggle, onDelete, onQuickAction, draggable = true }) {
  const content = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      data-testid="task-item"
    >
      <Card glass hover className="group">
        <div className="flex items-start gap-4">
          <motion.button
            type="button"
            onClick={() => onToggle(task)}
            className="mt-1 flex-shrink-0 rounded-full text-muted transition-all hover:text-accent hover:scale-110"
            aria-label="Toggle completion"
            aria-pressed={task.completed}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {task.completed ? (
              <CheckCircle2 className="h-6 w-6 text-success" />
            ) : (
              <Circle className="h-6 w-6" />
            )}
          </motion.button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`text-base font-semibold transition-all ${
                  task.completed ? 'text-muted/50 line-through' : 'text-text'
                }`}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-1.5">
                <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
                {task.aiSuggested && (
                  <Badge tone="blue">
                    <Sparkles className="h-3 w-3" />
                    AI
                  </Badge>
                )}
              </div>
            </div>

            {task.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
              {task.dueDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatDate(task.dueDate)}
                </span>
              )}
              {task.category && (
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  {task.category}
                </span>
              )}
              {Array.isArray(task.tags) && task.tags.length > 0 && (
                <div className="flex gap-1">
                  {task.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} tone="neutral">{tag}</Badge>
                  ))}
                  {task.tags.length > 2 && (
                    <Badge tone="neutral">+{task.tags.length - 2}</Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex-shrink-0">
            <motion.button
              type="button"
              onClick={() => onQuickAction(task)}
              className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="AI suggestions"
            >
              <Sparkles className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => onEdit(task)}
              className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Edit task"
            >
              <MoreHorizontal className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => onDelete(task)}
              className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
            <GripVertical className="h-4 w-4 text-muted/50" aria-hidden="true" />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (!draggable) {
    return content;
  }

  return (
    <Draggable draggableId={String(task._id)} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          animate={{
            scale: snapshot.isDragging ? 1.02 : 1,
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
        >
          {content}
        </motion.div>
      )}
    </Draggable>
  );
}

export default memo(TaskCard);
