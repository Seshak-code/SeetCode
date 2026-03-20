export const APP_NAME = 'SeetCode';

/**
 * Supported languages — single source of truth for both client and server.
 * Add a new entry here to enable a new language across the entire platform.
 */
export const SUPPORTED_LANGUAGES = [
  { id: 'cpp',        label: 'C++',        monacoId: 'cpp'        },
  { id: 'javascript', label: 'JavaScript', monacoId: 'javascript' },
  { id: 'python',     label: 'Python',     monacoId: 'python'     },
  { id: 'java',       label: 'Java',       monacoId: 'java'       },
];

export const DEFAULT_LANGUAGE = 'cpp';
