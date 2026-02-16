/**
 * Validates and sanitizes a role color string for safe inline styling.
 * Returns null if the color is invalid or unsafe.
 */
export function sanitizeRoleColor(color: string | null | undefined): string | null {
  if (!color) return null;
  
  // Remove whitespace
  const trimmed = color.trim();
  
  // Check for empty or default black color
  if (!trimmed || trimmed === '#000000' || trimmed === '#000') {
    return null;
  }
  
  // Validate hex color format (#RGB or #RRGGBB)
  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  if (!hexPattern.test(trimmed)) {
    return null;
  }
  
  return trimmed;
}

/**
 * Determines if a color is light or dark based on luminance.
 * Used to ensure readable contrast for text on colored backgrounds.
 */
export function isLightColor(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  let r: number, g: number, b: number;
  
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
}

/**
 * Gets a contrasting text color (black or white) for a given background color.
 */
export function getContrastColor(hexColor: string): string {
  return isLightColor(hexColor) ? '#000000' : '#ffffff';
}
