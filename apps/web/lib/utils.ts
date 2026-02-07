export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function validateName(name: string): { valid: boolean; message?: string } {
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  
  if (trimmed.length > 30) {
    return { valid: false, message: 'Name must be less than 30 characters' };
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return { valid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { valid: true };
}

export function validateRoomCode(code: string): { valid: boolean; message?: string } {
  const trimmed = code.trim().toUpperCase();
  
  if (trimmed.length !== 6) {
    return { valid: false, message: 'Room code must be 6 characters' };
  }
  
  if (!/^[A-Z0-9]{6}$/.test(trimmed)) {
    return { valid: false, message: 'Invalid room code format' };
  }
  
  return { valid: true };
}

export function validateMessage(text: string, minLength: number, maxLength: number): { valid: boolean; message?: string } {
  const trimmed = text.trim();
  
  if (trimmed.length < minLength) {
    return { valid: false, message: `Message must be at least ${minLength} characters` };
  }
  
  if (trimmed.length > maxLength) {
    return { valid: false, message: `Message must be less than ${maxLength} characters` };
  }
  
  return { valid: true };
}

export function hasForbiddenWords(text: string, forbidden: string[]): boolean {
  const lowerText = text.toLowerCase();
  return forbidden.some(word => lowerText.includes(word.toLowerCase()));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
