import api from '../services/api';

// Downloads a shared file through the authenticated API (only logged-in students can download).
export async function downloadFile(fileId, fileName) {
  try {
    const res = await api.get(`/files/${fileId}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    alert(err.response?.status === 404 ? 'This file is no longer available.' : 'Download failed. Please try again.');
  }
}

export const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
