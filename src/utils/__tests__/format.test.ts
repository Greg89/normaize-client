import {
  formatFileSize,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  capitalizeFirst,
  capitalizeWords,
  truncateText,
  slugify,
  formatPhoneNumber,
  formatDuration,
  formatTimeAgo,
  formatBytes,
  formatSpeed,
  formatProgress,
  formatUtils,
} from '../format';

describe('Format Utilities', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0.00 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
    });

    it('should handle decimal values correctly', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1536 * 1024)).toBe('1.5 MB');
    });

    it('should handle very small values', () => {
      expect(formatFileSize(100)).toBe('100.0 B');
      expect(formatFileSize(500)).toBe('500.0 B');
    });

    it('should handle invalid inputs', () => {
      expect(formatFileSize(-1)).toBe('-');
      expect(formatFileSize(NaN)).toBe('-');
      expect(formatFileSize(Infinity)).toBe('-');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2023-12-25T10:30:00Z');

    it('should format date with default options', () => {
      const result = formatDate(testDate);
      expect(result).toMatch(/Dec 25, 2023/);
    });

    it('should format date with custom options', () => {
      const result = formatDate(testDate, { month: 'long', year: 'numeric' });
      expect(result).toBe('December 25, 2023');
    });

    it('should handle string dates', () => {
      const result = formatDate('2023-12-25');
      expect(result).toMatch(/Dec \d+, 2023/);
    });

    it('should handle timestamp numbers', () => {
      const result = formatDate(testDate.getTime());
      expect(result).toMatch(/Dec 25, 2023/);
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date');
      expect(formatDate(NaN)).toBe('Invalid Date');
    });
  });

  describe('formatDateTime', () => {
    const testDate = new Date('2023-12-25T10:30:00Z');

    it('should format date and time correctly', () => {
      const result = formatDateTime(testDate);
      expect(result).toMatch(/Dec 25, 2023/);
      expect(result).toMatch(/\d{1,2}:\d{2}/); // Time format
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent times correctly', () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 60000); // 1 minute ago
      expect(formatRelativeTime(recentDate)).toBe('1m ago');
    });

    it('should format hours ago correctly', () => {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 3600000); // 1 hour ago
      expect(formatRelativeTime(hourAgo)).toBe('1h ago');
    });

    it('should format days ago correctly', () => {
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 86400000); // 1 day ago
      expect(formatRelativeTime(dayAgo)).toBe('1d ago');
    });

    it('should format months ago correctly', () => {
      const now = new Date();
      const monthAgo = new Date(now.getTime() - 2592000000); // 30 days ago
      expect(formatRelativeTime(monthAgo)).toBe('1mo ago');
    });

    it('should format years ago correctly', () => {
      const now = new Date();
      const yearAgo = new Date(now.getTime() - 31536000000); // 1 year ago
      expect(formatRelativeTime(yearAgo)).toBe('1y ago');
    });

    it('should handle just now', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('just now');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with default options', () => {
      expect(formatNumber(1234.5678)).toBe('1,234.57');
      expect(formatNumber(1000)).toBe('1,000');
    });

    it('should format numbers with custom options', () => {
      expect(formatNumber(1234.5678, { maximumFractionDigits: 3 })).toBe('1,234.568');
      expect(formatNumber(1000, { minimumFractionDigits: 2 })).toBe('1,000.00');
    });

    it('should handle invalid inputs', () => {
      expect(formatNumber(NaN)).toBe('-');
      expect(formatNumber(Infinity)).toBe('-');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('should format other currencies correctly', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
      expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56');
    });

    it('should handle invalid inputs', () => {
      expect(formatCurrency(NaN)).toBe('-');
      expect(formatCurrency(Infinity)).toBe('-');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(0.1234)).toBe('12.3%');
      expect(formatPercentage(0.5)).toBe('50.0%');
      expect(formatPercentage(1)).toBe('100.0%');
    });

    it('should handle custom decimal places', () => {
      expect(formatPercentage(0.1234, 2)).toBe('12.34%');
      expect(formatPercentage(0.5, 0)).toBe('50%');
    });

    it('should handle invalid inputs', () => {
      expect(formatPercentage(NaN)).toBe('-');
      expect(formatPercentage(Infinity)).toBe('-');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format large numbers compactly', () => {
      expect(formatCompactNumber(1000)).toBe('1K');
      expect(formatCompactNumber(1500000)).toBe('1.5M');
      expect(formatCompactNumber(1000000000)).toBe('1B');
    });

    it('should handle invalid inputs', () => {
      expect(formatCompactNumber(NaN)).toBe('-');
      expect(formatCompactNumber(Infinity)).toBe('-');
    });
  });

  describe('Text formatting utilities', () => {
    describe('capitalizeFirst', () => {
      it('should capitalize first letter only', () => {
        expect(capitalizeFirst('hello')).toBe('Hello');
        expect(capitalizeFirst('WORLD')).toBe('World');
        expect(capitalizeFirst('test')).toBe('Test');
      });

      it('should handle edge cases', () => {
        expect(capitalizeFirst('')).toBe('');
        expect(capitalizeFirst('a')).toBe('A');
        expect(capitalizeFirst('123')).toBe('123');
      });
    });

    describe('capitalizeWords', () => {
      it('should capitalize first letter of each word', () => {
        expect(capitalizeWords('hello world')).toBe('Hello World');
        expect(capitalizeWords('this is a test')).toBe('This Is A Test');
        expect(capitalizeWords('UPPER CASE')).toBe('Upper Case');
      });

      it('should handle edge cases', () => {
        expect(capitalizeWords('')).toBe('');
        expect(capitalizeWords('single')).toBe('Single');
        expect(capitalizeWords('123 456')).toBe('123 456');
      });
    });

    describe('truncateText', () => {
      it('should truncate text correctly', () => {
        expect(truncateText('Hello world', 5)).toBe('He...');
        expect(truncateText('Short', 10)).toBe('Short');
        expect(truncateText('Very long text that needs truncating', 15)).toBe('Very long te...');
      });

      it('should handle custom suffixes', () => {
        expect(truncateText('Hello world', 5, '***')).toBe('He***');
        expect(truncateText('Test', 10, '')).toBe('Test');
      });

      it('should handle edge cases', () => {
        expect(truncateText('', 5)).toBe('');
        expect(truncateText('Hello', 0)).toBe('...');
        expect(truncateText('Hello', 5, '')).toBe('Hello');
      });
    });

    describe('slugify', () => {
      it('should create URL-friendly slugs', () => {
        expect(slugify('Hello World')).toBe('hello-world');
        expect(slugify('This is a Test!')).toBe('this-is-a-test');
        expect(slugify('UPPER CASE')).toBe('upper-case');
      });

      it('should handle special characters', () => {
        expect(slugify('Hello@World#123')).toBe('helloworld123');
        expect(slugify('Test & More')).toBe('test-more');
        expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
      });

      it('should handle edge cases', () => {
        expect(slugify('')).toBe('');
        expect(slugify('   ')).toBe('');
        expect(slugify('---test---')).toBe('test');
      });
    });

    describe('formatPhoneNumber', () => {
      it('should format US phone numbers correctly', () => {
        expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
        expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
      });

      it('should handle phone numbers with existing formatting', () => {
        expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
        expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
        expect(formatPhoneNumber('123.456.7890')).toBe('(123) 456-7890');
      });

      it('should return original input for invalid formats', () => {
        expect(formatPhoneNumber('123')).toBe('123');
        expect(formatPhoneNumber('12345')).toBe('12345');
        expect(formatPhoneNumber('abcdef')).toBe('abcdef');
      });
    });
  });

  describe('Time formatting utilities', () => {
    describe('formatDuration', () => {
      it('should format seconds correctly', () => {
        expect(formatDuration(30)).toBe('30s');
        expect(formatDuration(90)).toBe('1m 30s');
        expect(formatDuration(3661)).toBe('1h 1m 1s');
      });

      it('should handle edge cases', () => {
        expect(formatDuration(0)).toBe('0s');
        expect(formatDuration(-1)).toBe('-');
        expect(formatDuration(NaN)).toBe('-');
      });
    });

    describe('formatTimeAgo', () => {
      it('should format time differences correctly', () => {
        const now = new Date();
        const minuteAgo = new Date(now.getTime() - 60000); // 1 minute ago
        const hourAgo = new Date(now.getTime() - 3600000); // 1 hour ago
        const dayAgo = new Date(now.getTime() - 86400000); // 1 day ago
        const monthAgo = new Date(now.getTime() - 2592000000); // 30 days ago
        const yearAgo = new Date(now.getTime() - 31536000000); // 1 year ago

        expect(formatTimeAgo(minuteAgo)).toBe('1 minute ago');
        expect(formatTimeAgo(hourAgo)).toBe('1 hour ago');
        expect(formatTimeAgo(dayAgo)).toBe('1 day ago');
        expect(formatTimeAgo(monthAgo)).toBe('1 month ago');
        expect(formatTimeAgo(yearAgo)).toBe('1 year ago');
      });

      it('should handle future dates', () => {
        const now = new Date();
        const futureDate = new Date(now.getTime() + 3600000); // 1 hour in the future
        expect(formatTimeAgo(futureDate)).toBe('in the future');
      });

      it('should handle edge cases', () => {
        const now = new Date();
        expect(formatTimeAgo(now)).toBe('just now');
      });
    });
  });

  describe('Data formatting utilities', () => {
    describe('formatBytes', () => {
      it('should format bytes correctly', () => {
        expect(formatBytes(0)).toBe('0 Bytes');
        expect(formatBytes(1024)).toBe('1 KB');
        expect(formatBytes(1024 * 1024)).toBe('1 MB');
        expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
      });

      it('should handle custom decimal places', () => {
        expect(formatBytes(1536, 3)).toBe('1.5 KB');
        expect(formatBytes(1536 * 1024, 1)).toBe('1.5 MB');
      });
    });

    describe('formatSpeed', () => {
      it('should format speed correctly', () => {
        expect(formatSpeed(1024)).toBe('1 KB/s');
        expect(formatSpeed(1024 * 1024)).toBe('1 MB/s');
      });
    });

    describe('formatProgress', () => {
      it('should format progress percentages correctly', () => {
        expect(formatProgress(50, 100)).toBe('50.0%');
        expect(formatProgress(25, 50)).toBe('50.0%');
        expect(formatProgress(0, 100)).toBe('0.0%');
      });

      it('should handle edge cases', () => {
        expect(formatProgress(0, 0)).toBe('0%');
        expect(formatProgress(100, 0)).toBe('0%');
      });
    });
  });

  describe('formatUtils export', () => {
    it('should export all formatting functions', () => {
      expect(formatUtils).toHaveProperty('formatFileSize');
      expect(formatUtils).toHaveProperty('formatDate');
      expect(formatUtils).toHaveProperty('formatDateTime');
      expect(formatUtils).toHaveProperty('formatRelativeTime');
      expect(formatUtils).toHaveProperty('formatNumber');
      expect(formatUtils).toHaveProperty('formatCurrency');
      expect(formatUtils).toHaveProperty('formatPercentage');
      expect(formatUtils).toHaveProperty('formatCompactNumber');
      expect(formatUtils).toHaveProperty('capitalizeFirst');
      expect(formatUtils).toHaveProperty('capitalizeWords');
      expect(formatUtils).toHaveProperty('truncateText');
      expect(formatUtils).toHaveProperty('slugify');
      expect(formatUtils).toHaveProperty('formatPhoneNumber');
      expect(formatUtils).toHaveProperty('formatDuration');
      expect(formatUtils).toHaveProperty('formatTimeAgo');
      expect(formatUtils).toHaveProperty('formatBytes');
      expect(formatUtils).toHaveProperty('formatSpeed');
      expect(formatUtils).toHaveProperty('formatProgress');
    });

    it('should have working functions in formatUtils', () => {
      expect(formatUtils.formatFileSize(1024)).toBe('1.0 KB');
      expect(formatUtils.capitalizeFirst('hello')).toBe('Hello');
      expect(formatUtils.formatNumber(1000)).toBe('1,000');
    });
  });
});
