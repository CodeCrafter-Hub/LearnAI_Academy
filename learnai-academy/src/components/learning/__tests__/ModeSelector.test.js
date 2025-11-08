import { render, screen, fireEvent } from '@testing-library/react';
import ModeSelector from '../ModeSelector';

describe('ModeSelector', () => {
  const mockOnSelect = jest.fn();
  const defaultProps = {
    onSelect: mockOnSelect,
    topicName: 'Fractions',
  };

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('should render Practice and Help mode buttons', () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByText('Practice Mode')).toBeInTheDocument();
    expect(screen.getByText('Help Mode')).toBeInTheDocument();
  });

  it('should display the topic name', () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByText('Fractions')).toBeInTheDocument();
  });

  it('should display mode descriptions', () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByText('Solve problems and get instant feedback')).toBeInTheDocument();
    expect(screen.getByText('Ask questions and get explanations')).toBeInTheDocument();
  });

  it('should display mode features', () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByText('✓ Structured practice')).toBeInTheDocument();
    expect(screen.getByText('✓ Bonus points')).toBeInTheDocument();
    expect(screen.getByText('✓ Open Q&A')).toBeInTheDocument();
    expect(screen.getByText('✓ Deep learning')).toBeInTheDocument();
  });

  it('should call onSelect with PRACTICE when Practice button is clicked', () => {
    render(<ModeSelector {...defaultProps} />);

    const practiceButton = screen.getByText('Practice Mode').closest('button');
    fireEvent.click(practiceButton);

    expect(mockOnSelect).toHaveBeenCalledWith('PRACTICE');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect with HELP when Help button is clicked', () => {
    render(<ModeSelector {...defaultProps} />);

    const helpButton = screen.getByText('Help Mode').closest('button');
    fireEvent.click(helpButton);

    expect(mockOnSelect).toHaveBeenCalledWith('HELP');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should display mode emojis', () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByText('🎯')).toBeInTheDocument(); // Practice
    expect(screen.getByText('💡')).toBeInTheDocument(); // Help
  });

  it('should render with default empty topicName', () => {
    render(<ModeSelector onSelect={mockOnSelect} />);

    // Should not crash, topic name section should be empty
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
  });
});
