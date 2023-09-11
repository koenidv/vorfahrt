/**
 * src: ChatGPT-4
 */
export function checkObjectPropertiesRecursively(obj: unknown, callback: (key: string) => void) {
    // Check if the given object is actually an object or an array
    if (typeof obj !== 'object' || obj === null) {
        return;
    }

    // If it's an array, loop through each element
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            checkObjectPropertiesRecursively(obj[i], callback);
        }
        return;
    }

    // If it's an object, loop through each property
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            // Invoke the callback with the current key
            callback(key);

            // Recurse into the property
            checkObjectPropertiesRecursively(obj[key], callback);
        }
    }
}