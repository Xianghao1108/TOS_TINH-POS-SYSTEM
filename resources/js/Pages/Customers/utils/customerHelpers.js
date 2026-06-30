export const padCustomerId = (id) => `#${String(id || 0).padStart(4, '0')}`;
