import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskComposer from './TaskComposer';

jest.mock('../../services/aiService', () => ({
  parseNaturalLanguageTask: jest.fn(async () => ({ structuredText: 'Title: Draft roadmap' })),
}));

describe('TaskComposer', () => {
  test('submits valid task data', async () => {
    const onSubmit = jest.fn(async () => true);
    render(<TaskComposer onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/task title/i), 'Ship release');
    await userEvent.click(screen.getByRole('button', { name: /save task/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Ship release',
          priority: 'medium',
        })
      );
    });
  });

  test('shows a validation error for short titles', async () => {
    render(<TaskComposer onSubmit={jest.fn()} />);

    await userEvent.type(screen.getByLabelText(/task title/i), 'A');
    await userEvent.click(screen.getByRole('button', { name: /save task/i }));

    expect(await screen.findByText(/at least 2/i)).toBeInTheDocument();
  });

  test('requires text before AI parsing', async () => {
    render(<TaskComposer onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /ai parse/i }));

    expect(await screen.findByText(/enter a short task request/i)).toBeInTheDocument();
  });
});
