import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileDropzone } from '../FileDropzone';

describe('FileDropzone', () => {
  it('should render drop zone', () => {
    const onFilesSelected = vi.fn();
    render(<FileDropzone onFilesSelected={onFilesSelected} />);
    
    expect(screen.getByText(/drag.*drop.*audio files/i)).toBeInTheDocument();
  });

  it('should validate file type', async () => {
    const onFilesSelected = vi.fn();
    render(<FileDropzone onFilesSelected={onFilesSelected} />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    expect(onFilesSelected).not.toHaveBeenCalled();
  });

  it('should accept valid audio files', async () => {
    const onFilesSelected = vi.fn();
    render(<FileDropzone onFilesSelected={onFilesSelected} />);
    
    const file = new File(['test'], 'test.mp3', { type: 'audio/mp3' });
    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });

  it('should handle drag and drop', async () => {
    const onFilesSelected = vi.fn();
    render(<FileDropzone onFilesSelected={onFilesSelected} />);
    
    const dropzone = screen.getByText(/drag.*drop.*audio files/i).parentElement!;
    const file = new File(['test'], 'test.mp3', { type: 'audio/mp3' });
    
    const dataTransfer = {
      files: [file],
      items: [{
        kind: 'file',
        type: file.type,
        getAsFile: () => file,
      }],
      types: ['Files'],
    };
    
    fireEvent.dragEnter(dropzone, { dataTransfer });
    fireEvent.dragOver(dropzone, { dataTransfer });
    fireEvent.drop(dropzone, { dataTransfer });
    
    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });

  it('should enforce max files limit', async () => {
    const onFilesSelected = vi.fn();
    render(<FileDropzone onFilesSelected={onFilesSelected} maxFiles={2} />);
    
    const files = [
      new File(['test1'], 'test1.mp3', { type: 'audio/mp3' }),
      new File(['test2'], 'test2.mp3', { type: 'audio/mp3' }),
      new File(['test3'], 'test3.mp3', { type: 'audio/mp3' }),
    ];
    
    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: files,
      writable: false,
    });
    
    fireEvent.change(input);
    
    expect(screen.getByText(/maximum 2 files allowed/i)).toBeInTheDocument();
    expect(onFilesSelected).not.toHaveBeenCalled();
  });
});