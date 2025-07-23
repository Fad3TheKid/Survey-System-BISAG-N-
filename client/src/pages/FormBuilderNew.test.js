import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormBuilderNew from './FormBuilderNew';

describe('FormBuilderNew Component', () => {
  test('renders form title and description inputs', () => {
    render(<FormBuilderNew />);
    const titleInput = screen.getByPlaceholderText(/Untitled form/i);
    const descriptionInput = screen.getByPlaceholderText(/Form description/i);
    expect(titleInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();
  });

  test('allows user to update form title and description', () => {
    render(<FormBuilderNew />);
    const titleInput = screen.getByPlaceholderText(/Untitled form/i);
    const descriptionInput = screen.getByPlaceholderText(/Form description/i);

    fireEvent.change(titleInput, { target: { value: 'New Form Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Form Description' } });

    expect(titleInput.value).toBe('New Form Title');
    expect(descriptionInput.value).toBe('New Form Description');
  });

  test('renders Add question button and adds a question', () => {
    render(<FormBuilderNew />);
    const addButton = screen.getByRole('button', { name: /Add question/i });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    const questionCards = screen.getAllByText(/Untitled Question/i);
    expect(questionCards.length).toBeGreaterThan(0);
  });

  test('tab switching works correctly', () => {
    render(<FormBuilderNew />);
    const questionsTab = screen.getByRole('tab', { name: /Questions/i });
    const responsesTab = screen.getByRole('tab', { name: /Responses/i });
    const settingsTab = screen.getByRole('tab', { name: /Settings/i });

    expect(questionsTab).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(responsesTab);
    expect(responsesTab).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(settingsTab);
    expect(settingsTab).toHaveAttribute('aria-selected', 'true');
  });

  // Additional tests can be added for question card duplicate/delete, side toolbar visibility, and Settings tab UI
});
