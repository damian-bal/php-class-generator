import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { NamespaceResolver } from './utils/namespaceResolver';
import { ComposerNamespaceResolver } from './utils/composerNamespaceResolver';
import { generatePhpFileContent } from './utils/utils';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand(
			'phpClassGenerator.generateClass',
			async () => {
				if (!vscode.workspace && !vscode.workspace.name) {
					vscode.window.showWarningMessage("You need to have a workspace open!");
					return;
				}

				const root = vscode.workspace.rootPath;

				let composerDocument = null;
				try {
					composerDocument = await vscode.workspace.openTextDocument(root + path.sep + 'composer.json');
				} catch (error) {
					vscode.window.showErrorMessage("Problem reading composer.json file!");
					return;
				}

				const folder = await vscode.window.showOpenDialog(
					{
						canSelectFiles: false,
						canSelectFolders: true,
						canSelectMany: false,
						openLabel: "Select folder"
					}
				);

				if (!folder) {
					return;
				}

				const name = await vscode.window.showInputBox(
					{
						placeHolder: "Name",
						prompt: "Name of class/interface/trait"
					}
				);

				if (!name) {
					return;
				}

				const type = await vscode.window.showQuickPick(
					[
						"class",
						"interface",
						"trait"
					],
					{
						placeHolder: "Select what to generate"
					}
				);

				if (!type) {
					return;
				}

				const namespaceResolver: NamespaceResolver = new ComposerNamespaceResolver(composerDocument.getText());
				const namespace = namespaceResolver.resolve(vscode.workspace.asRelativePath(folder[0].fsPath).split(path.sep));

				if (!namespace) {
					vscode.window.showErrorMessage("Problem with resolving namespace!");
					return;
				}

				const newFilePath = path.join(folder[0].fsPath, name) + ".php";
				fs.writeFileSync(newFilePath, generatePhpFileContent({ name, type, namespace }));

				const openPath = vscode.Uri.file(newFilePath);
				vscode.workspace.openTextDocument(openPath).then(doc => {
					vscode.window.showTextDocument(doc);
				});
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'phpClassGenerator.insertNamespace',
			async () => {

			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'phpClassGenerator.insertClass',
			async () => {

			}
		)
	);
}

export function deactivate() { }