import { NamespaceResolver } from './namespaceResolver';

interface Psr4 {
    prefix: string;
    path: string;
}

interface ComposerAutoload {
    'psr-4'?: { [key: string]: string; }
}

interface Composer {
    autoload?: ComposerAutoload;
    'autoload-dev'?: ComposerAutoload;
}

export class ComposerNamespaceResolver implements NamespaceResolver {
    composer: Composer | null = null;
    psr4: Psr4[] = [];

    constructor(composerFileContent: string) {
        this.composer = JSON.parse(composerFileContent);

        if (this.composer) {
            if (this.composer.autoload) {
                const psr4 = this.composer.autoload["psr-4"] ?? {};

                for (const prefix in psr4) {
                    const path = psr4[prefix];

                    if (Array.isArray(path)) {
                        for (const pathItem of path) {
                            this.psr4.push({ prefix, path: pathItem });
                        }
                    } else {
                        this.psr4.push({ prefix, path });
                    }
                }
            }

            if (this.composer["autoload-dev"]) {
                const psr4 = this.composer["autoload-dev"]["psr-4"] ?? {};

                for (const prefix in psr4) {
                    const path = psr4[prefix];

                    if (Array.isArray(path)) {
                        for (const pathItem of path) {
                            this.psr4.push({ prefix, path: pathItem });
                        }
                    } else {
                        this.psr4.push({ prefix, path });
                    }
                }
            }
        }
    }

    resolve(pathSegments: string[], addPath: string): string | null {
        const fullPath = pathSegments.join('/');
        const matchingPsr4 = this.psr4.find(psr4 => fullPath.startsWith(addPath + psr4.path));

        if (!matchingPsr4) {
            return null;
        }

        const namespacePath = fullPath.replace(matchingPsr4.path, '');
        const namespacePathSegments = namespacePath.split('/');
        const prefixNamespaceSegments = matchingPsr4?.prefix.split('\\').filter(item => item.length >= 1);

        return prefixNamespaceSegments.concat(namespacePathSegments).join('\\');
    }
}
