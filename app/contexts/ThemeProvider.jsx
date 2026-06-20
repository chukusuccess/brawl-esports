"use client";

// Kept as a tiny compatibility wrapper for any future route that imports it.
// The site uses native CSS tokens rather than a UI-library provider.
export function AntThemeProvider({ children }) {
  return children;
}
