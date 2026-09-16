/** Strip HTML tags and dangerous patterns from user input */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')              // strip HTML tags
    .replace(/javascript:/gi, '')          // remove JS protocol
    .replace(/on\w+\s*=/gi, '')            // remove event handlers
    .trim();
}

/** Sanitize a plain caption/bio — allow newlines but strip HTML */
export function sanitizeCaption(input: string): string {
  return sanitizeText(input).slice(0, 2200); // Instagram-style 2200 char limit
}
