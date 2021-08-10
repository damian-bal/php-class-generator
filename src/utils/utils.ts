export function generatePhpFileContent(data: { type: string, name: string, namespace: string }): string {
    let content = "<?php\n";
    content += "\n";
    content += "declare(strict_types=1);"
    content += "\n";
    content += `namespace ${data.namespace};\n`;
    content += "\n";
    content += `${data.type} ${data.name}\n`;
    content += "{\n";
    content += "\n";
    content += "}\n";
    return content;
}
