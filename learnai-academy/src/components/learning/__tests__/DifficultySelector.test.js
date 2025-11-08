import { render, screen, fireEvent } from '@testing-library/react';
import DifficultySelector from '../DifficultySelector';

describe('DifficultySelector', () => {
  const mockOnSelect = jest.fn();
  const defaultProps = {
    onSelect: mockOnSelect,
    topicName: 'Addition',
    mode: 'PRACTICE',
    isLoading: false,
  };

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('should render all three difficulty levels', () => {
    render(<DifficultySelector {...defaultProps} />);

    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });

  it('should display the topic name and mode', () => {
    render(<DifficultySelector {...defaultProps} />);

    expect(screen.getByText(/Addition - Practice Mode/i)).toBeInTheDocument();
  });

  it('should display Help mode when mode is HELP', () => {
    render(<DifficultySelector {...defaultProps} mode="HELP" />);

    expect(screen.getByText(/Addition - Help Mode/i)).toBeInTheDocument();
  });

  it('should show correct point multipliers', () => {
    render(<DifficultySelector {...defaultProps} />);

    expect(screen.getByText('Points: 1x')).toBeInTheDocument();
    expect(screen.getByText('Points: 1.2x')).toBeInTheDocument();
    expect(screen.getByText('Points: 1.5x')).toBeInTheDocument();
  });

  it('should show difficulty descriptions', () => {
    render(<DifficultySelector {...defaultProps} />);

    expect(screen.getByText('Perfect for learning new concepts')).toBeInTheDocument();
    expect(screen.getByText('Good balance of challenge')).toBeInTheDocument();
    expect(screen.getByText('Maximum challenge')).toBeInTheDocument();
  });

  it('should call onSelect with EASY when Easy button is clicked', () => {
    render(<DifficultySelector {...defaultProps} />);

    const easyButton = screen.getByText('Easy').closest('button');
    fireEvent.click(easyButton);

    expect(mockOnSelect).toHaveBeenCalledWith('EASY');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect with MEDIUM when Medium button is clicked', () => {
    render(<DifficultySelector {...defaultProps} />);

    const mediumButton = screen.getByText('Medium').closest('button');
    fireEvent.click(mediumButton);

    expect(mockOnSelect).toHaveBeenCalledWith('MEDIUM');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect with HARD when Hard button is clicked', () => {
    render(<DifficultySelector {...defaultProps} />);

    const hardButton = screen.getByText('Hard').closest('button');
    fireEvent.click(hardButton);

    expect(mockOnSelect).toHaveBeenCalledWith('HARD');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should disable all buttons when isLoading is true', () => {
    render(<DifficultySelector {...defaultProps} isLoading={true} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should not disable buttons when isLoading is false', () => {
    render(<DifficultySelector {...defaultProps} isLoading={false} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).not.toBeDisabled();
    });
  });

  it('should not call onSelect when button is clicked while loading', () => {
    render(<DifficultySelector {...defaultProps} isLoading={true} />);

    const easyButton = screen.getByText('Easy').closest('button');
    fireEvent.click(easyButton);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should display difficulty emojis', () => {
    render(<DifficultySelector {...defaultProps} />);

    expect(screen.getByText('🌱')).toBeInTheDocument(); // Easy
    expect(screen.getByText('🌟')).toBeInTheDocument(); // Medium
    expect(screen.getByText('🔥')).toBeInTheDocument(); // Hard
  });
});
