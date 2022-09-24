export interface NamespaceResolver {
    resolve(pathSegments: string[], addPath: string): string | null;
}
