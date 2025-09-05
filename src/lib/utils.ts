import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// File size formatter
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'] as const;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Generate random share code (4-digit numeric)
export function generateShareCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Validate share code (4-digit numeric)
export function validateShareCode(code: string): boolean {
  return /^\d{4}$/.test(code);
}

// File icon mapping
const iconMap = {
  image: '🖼️',
  video: '🎥',
  audio: '🎵',
  document: '📄',
  archive: '📦',
  code: '💻',
  pdf: '📕',
  default: '📁'
} as const;

// Get file icon based on type
export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return iconMap.image;
  if (fileType.startsWith('video/')) return iconMap.video;
  if (fileType.startsWith('audio/')) return iconMap.audio;
  if (fileType.includes('pdf')) return iconMap.pdf;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return iconMap.archive;
  if (fileType.includes('text') || fileType.includes('document')) return iconMap.document;
  if (fileType.includes('javascript') || fileType.includes('python') || fileType.includes('java')) return iconMap.code;
  
  return iconMap.default;
}

// Debounce function with proper typing
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

// Format date with proper typing
export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

// Calculate transfer speed
export function calculateSpeed(bytes: number, seconds: number): string {
  if (seconds === 0) return '0 B/s';
  const speed = bytes / seconds;
  return `${formatFileSize(speed)}/s`;
}

// Input sanitization functions for security
export function sanitizeString(input: unknown, maxLength: number = 255): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>"'&]/g, (match) => {
      const htmlEntities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return htmlEntities[match] || match;
    });
}

export function sanitizeFileName(fileName: unknown): string {
  if (typeof fileName !== 'string') return 'unnamed';
  
  // Remove dangerous characters and limit length
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 100)
    .replace(/^\.|\.$/g, '_');
}

export function validateFileSize(size: unknown, maxSize: number = 100 * 1024 * 1024): boolean {
  return typeof size === 'number' && size > 0 && size <= maxSize;
}

export function sanitizeShareCode(code: unknown): string {
  if (typeof code !== 'string') return '';
  // Only allow 4-digit numeric codes
  return code.replace(/\D/g, '').slice(0, 4);
}