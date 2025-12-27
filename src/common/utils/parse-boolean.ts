/**
 * Parse a string value to boolean
 * Handles "true"/"false" strings from form inputs and URL params
 */
export const parseBoolean = (value: unknown): boolean | undefined => {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return undefined;
};
