/**
 * NestJS error response types
 */
interface NestJSErrorResponse {
    response?: {
        data?: {
            message?: string | string[] | ValidationError[];
            error?: string;
            statusCode?: number;
        };
    };
}

interface ValidationError {
    property?: string;
    constraints?: Record<string, string>;
    children?: ValidationError[];
}

/**
 * Extract error messages from class-validator ValidationError objects
 */
const extractValidationErrors = (errors: ValidationError[]): string[] => {
    const messages: string[] = [];

    for (const error of errors) {
        if (error.constraints) {
            messages.push(...Object.values(error.constraints));
        }
        if (error.children && error.children.length > 0) {
            messages.push(...extractValidationErrors(error.children));
        }
    }

    return messages;
};

/**
 * Check if value is a ValidationError object
 */
const isValidationError = (value: unknown): value is ValidationError => {
    return typeof value === "object" && value !== null && "property" in value;
};

/**
 * Extract error message from NestJS/Axios error response
 * Handles: string, string[], and class-validator ValidationError[]
 *
 * @param error - The error object from catch block
 * @returns Formatted error message string or undefined
 */
export const getServerErrorMessage = (error: unknown): string | undefined => {
    const nestError = error as NestJSErrorResponse;
    const message = nestError?.response?.data?.message;

    if (!message) {
        return undefined;
    }

    // Simple string message
    if (typeof message === "string") {
        return message;
    }

    // Array of messages
    if (Array.isArray(message)) {
        // Check if it's an array of ValidationError objects
        if (message.length > 0 && isValidationError(message[0])) {
            const validationMessages = extractValidationErrors(message as ValidationError[]);
            return validationMessages.join(", ");
        }

        // Array of strings
        return (message as string[]).join(", ");
    }

    return undefined;
};
