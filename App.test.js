import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renders the dashboard by default', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /this week/i })).toBeInTheDocument();
});

test('can navigate to the tasks tab', () => {
  render(<App />);
  screen.getByRole('button', { name: /tasks/i }).click();
  expect(screen.getByRole('heading', { name: /^tasks$/i })).toBeInTheDocument();
});

test('can navigate to the focus timer tab', () => {
  render(<App />);
  screen.getByRole('button', { name: /focus timer/i }).click();
  expect(screen.getByRole('heading', { name: /focus timer/i })).toBeInTheDocument();
});
