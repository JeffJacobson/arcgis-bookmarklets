/**
 * This error is for use when a string is not in the format
 * that is expected.
 */
export default class FormatError extends Error {
    /**
     * Creates a new FormatError instance
     * @param value - The improperly formatted string
     * @param regex - A Regular Expression that shows the correct format.
     */
    constructor(public value: string, public regex: RegExp) {
        super(`"${value}" does not match ${regex}`);
    }
}