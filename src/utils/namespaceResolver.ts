export interface NamespaceResolver {
    resolve(pathSegments: string[]): string | null;
}
