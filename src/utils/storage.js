const KEY = 'qvp_editor';
export const storage = {
  saveEditorState(data) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} },
  loadEditorState() { try { const d = localStorage.getItem(KEY); return d ? JSON.parse(d) : null; } catch { return null; } },
  clear() { try { localStorage.removeItem(KEY); } catch {} }
};
