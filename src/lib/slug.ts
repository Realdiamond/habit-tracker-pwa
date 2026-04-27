/**
 * Converts a habit name into a URL-friendly slug.
 *
 * Rules (Section 9):
 * - Convert to lowercase
 * - Trim leading and trailing spaces
 * - Replace one or more spaces with a single hyphen
 * - Remove non-alphanumeric characters except hyphens
 * - Return a stable slug
 *
 * Examples:
 *   "Drink Water" => "drink-water"
 *   "Read Books"  => "read-books"
 */
export function getHabitSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
