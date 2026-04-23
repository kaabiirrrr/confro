export const logger = {
  log: (...args) => {
    if (import.meta.env.DEV) console.log(...args);
  },
  info: (...args) => {
    if (import.meta.env.DEV) console.info(...args);
  },
  warn: (...args) => {
    if (import.meta.env.DEV) console.warn(...args);
  },
  debug: (...args) => {
    if (import.meta.env.DEV) console.debug(...args);
  },
  error: (...args) => console.error(...args),
};

export default logger;
