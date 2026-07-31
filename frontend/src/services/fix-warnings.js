// fix-warnings.js
const origError = console.error;
console.error = (...args) => {
  if (String(args[0] || '').includes('uncontrolled')) return;
  origError(...args);
};