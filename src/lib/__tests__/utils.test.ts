import {
  formatFileSize,
  generateShareCode,
  validateShareCode,
  getFileIcon,
  debounce,
  copyToClipboard,
  formatDate,
  calculateSpeed,
  sanitizeString,
  sanitizeFileName,
  validateFileSize,
  sanitizeShareCode,
} from '../utils';

// Mock navigator.clipboard for testing
const mockClipboard = {
  writeText: jest.fn(),
};
Object.assign(navigator, {
  clipboard: mockClipboard,
});

describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1073741824)).toBe('1 GB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('handles decimal places correctly', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1536000)).toBe('1.46 MB');
  });
});

describe('generateShareCode', () => {
  it('generates a 4-digit string', () => {
    const code = generateShareCode();
    expect(code).toHaveLength(4);
    expect(/^\d{4}$/.test(code)).toBe(true);
  });

  it('generates different codes on multiple calls', () => {
    const codes = Array.from({ length: 10 }, () => generateShareCode());
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBeGreaterThan(1);
  });

  it('generates codes within valid range', () => {
    const code = generateShareCode();
    const codeNumber = parseInt(code, 10);
    expect(codeNumber).toBeGreaterThanOrEqual(1000);
    expect(codeNumber).toBeLessThanOrEqual(9999);
  });
});

describe('validateShareCode', () => {
  it('validates correct 4-digit codes', () => {
    expect(validateShareCode('1234')).toBe(true);
    expect(validateShareCode('0000')).toBe(true);
    expect(validateShareCode('9999')).toBe(true);
  });

  it('rejects invalid codes', () => {
    expect(validateShareCode('123')).toBe(false);
    expect(validateShareCode('12345')).toBe(false);
    expect(validateShareCode('abcd')).toBe(false);
    expect(validateShareCode('12a4')).toBe(false);
    expect(validateShareCode('')).toBe(false);
  });
});

describe('getFileIcon', () => {
  it('returns correct icons for different file types', () => {
    expect(getFileIcon('image/jpeg')).toBe('🖼️');
    expect(getFileIcon('video/mp4')).toBe('🎥');
    expect(getFileIcon('audio/mp3')).toBe('🎵');
    expect(getFileIcon('application/pdf')).toBe('📕');
    expect(getFileIcon('application/zip')).toBe('📦');
    expect(getFileIcon('text/javascript')).toBe('📄'); // text files return document icon
    expect(getFileIcon('text/plain')).toBe('📄');
  });

  it('returns default icon for unknown types', () => {
    expect(getFileIcon('unknown/type')).toBe('📁');
    expect(getFileIcon('')).toBe('📁');
  });
});

describe('debounce', () => {
  jest.useFakeTimers();

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('delays function execution', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('arg1', 'arg2');
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('cancels previous calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first');
    debouncedFn('second');
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('second');
  });
});

describe('copyToClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully copies text to clipboard', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);

    const result = await copyToClipboard('test text');
    expect(result).toBe(true);
    expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
  });

  it('handles clipboard errors', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await copyToClipboard('test text');
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe('formatDate', () => {
  it('formats date objects correctly', () => {
    const date = new Date('2023-12-25T10:30:00Z');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/Dec 25, 2023/);
  });

  it('formats date strings correctly', () => {
    const formatted = formatDate('2023-12-25T10:30:00Z');
    expect(formatted).toMatch(/Dec 25, 2023/);
  });

  it('formats timestamps correctly', () => {
    const timestamp = Date.UTC(2023, 11, 25, 10, 30, 0);
    const formatted = formatDate(timestamp);
    expect(formatted).toMatch(/Dec 25, 2023/);
  });
});

describe('calculateSpeed', () => {
  it('calculates speed correctly', () => {
    expect(calculateSpeed(1024, 1)).toBe('1 KB/s');
    expect(calculateSpeed(1048576, 2)).toBe('512 KB/s');
    expect(calculateSpeed(2097152, 1)).toBe('2 MB/s');
  });

  it('handles zero time', () => {
    expect(calculateSpeed(1024, 0)).toBe('0 B/s');
  });
});

describe('sanitizeString', () => {
  it('sanitizes HTML characters', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(sanitizeString('Hello & World')).toBe('Hello &amp; World');
    expect(sanitizeString("It's a test")).toBe('It&#x27;s a test');
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello world  ')).toBe('hello world');
  });

  it('respects max length', () => {
    expect(sanitizeString('hello world', 5)).toBe('hello');
  });

  it('handles non-string input', () => {
    expect(sanitizeString(123)).toBe('');
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
  });
});

describe('sanitizeFileName', () => {
  it('removes dangerous characters', () => {
    expect(sanitizeFileName('file<>name.txt')).toBe('file__name.txt');
    expect(sanitizeFileName('file/path\\name.txt')).toBe('file_path_name.txt');
  });

  it('handles dot sequences', () => {
    expect(sanitizeFileName('file...txt')).toBe('file.txt');
    expect(sanitizeFileName('....txt')).toBe('_txt');
  });

  it('handles edge cases', () => {
    expect(sanitizeFileName('.hidden')).toBe('_hidden');
    expect(sanitizeFileName('file.')).toBe('file_');
    expect(sanitizeFileName('')).toBe('');
  });

  it('respects length limit', () => {
    const longName = `${'a'.repeat(150)  }.txt`;
    const result = sanitizeFileName(longName);
    expect(result.length).toBeLessThanOrEqual(100);
  });
});

describe('validateFileSize', () => {
  it('validates correct file sizes', () => {
    expect(validateFileSize(1024)).toBe(true);
    expect(validateFileSize(50 * 1024 * 1024)).toBe(true);
  });

  it('rejects invalid sizes', () => {
    expect(validateFileSize(0)).toBe(false);
    expect(validateFileSize(-1024)).toBe(false);
    expect(validateFileSize(200 * 1024 * 1024)).toBe(false); // > 100MB default
  });

  it('respects custom max size', () => {
    expect(validateFileSize(50 * 1024 * 1024, 30 * 1024 * 1024)).toBe(false);
    expect(validateFileSize(20 * 1024 * 1024, 30 * 1024 * 1024)).toBe(true);
  });

  it('handles non-number input', () => {
    expect(validateFileSize('1024')).toBe(false);
    expect(validateFileSize(null)).toBe(false);
    expect(validateFileSize(undefined)).toBe(false);
  });
});

describe('sanitizeShareCode', () => {
  it('extracts digits from mixed input', () => {
    expect(sanitizeShareCode('a1b2c3d4')).toBe('1234');
    expect(sanitizeShareCode('12ab34')).toBe('1234');
  });

  it('limits to 4 digits', () => {
    expect(sanitizeShareCode('123456789')).toBe('1234');
  });

  it('handles non-string input', () => {
    expect(sanitizeShareCode(1234)).toBe('');
    expect(sanitizeShareCode(null)).toBe('');
    expect(sanitizeShareCode(undefined)).toBe('');
  });

  it('handles empty or non-digit strings', () => {
    expect(sanitizeShareCode('')).toBe('');
    expect(sanitizeShareCode('abcd')).toBe('');
  });
});