export function parse<T>(json: string): T {
    const parsed = JSON.parse(json);
    return parsed as T;
}