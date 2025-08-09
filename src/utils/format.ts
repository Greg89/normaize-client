export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '-';
  const mb = bytes / 1024 / 1024;
  if (mb < 0.01) return '< 0.01 MB';
  return `${mb.toFixed(2)} MB`;
}


