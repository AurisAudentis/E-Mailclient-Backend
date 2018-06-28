export function assert(message: string, bool: boolean = false, name= "AssertionError") {
    if (!bool) {
        console.error("Error: " + message);
        throw {
            name,
            message,
        };
    }
}
