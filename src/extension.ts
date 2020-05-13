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

				let root = null;
				if (vscode.workspace.workspaceFolders) {
					root = vscode.workspace.workspaceFolders[0].uri.fsPath;
				}

				if (!root) {
					return;
				}

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
						openLabel: "Select folder where new class should be placed"
					}
				);

				if (!folder) {
					return;
				}

				if (folder[0] && folder[0].fsPath.split(path.sep).indexOf(vscode.workspace.name ?? '') === -1) {
					vscode.window.showErrorMessage("Wrong folder!");
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

				vscode.workspace.openTextDocument(vscode.Uri.file(newFilePath)).then(doc => {
					vscode.window.showTextDocument(doc);
				});
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'phpClassGenerator.insertNamespace',
			async () => {
				if (!vscode.window.activeTextEditor) {
					return;
				}

				if (!vscode.workspace && !vscode.workspace.name) {
					vscode.window.showWarningMessage("You need to have a workspace open!");
					return;
				}

				let root = null;
				if (vscode.workspace.workspaceFolders) {
					root = vscode.workspace.workspaceFolders[0].uri.fsPath;
				}

				if (!root) {
					return;
				}

				let namespacePathSegments = vscode.window.activeTextEditor.document.fileName.split(path.sep);
				namespacePathSegments.pop();
				namespacePathSegments = vscode.workspace.asRelativePath(namespacePathSegments.join(path.sep)).split(path.sep);

				let composerDocument = null;
				try {
					composerDocument = await vscode.workspace.openTextDocument(root + path.sep + 'composer.json');
				} catch (error) {
					console.error(error);
					vscode.window.showErrorMessage("Problem reading composer.json file!");
					return;
				}

				const namespaceResolver: NamespaceResolver = new ComposerNamespaceResolver(composerDocument.getText());
				const namespace = namespaceResolver.resolve(namespacePathSegments);

				if (!namespace) {
					vscode.window.showErrorMessage("Problem with resolving namespace!");
					return;
				}

				const editor = vscode.window.activeTextEditor;
				editor.edit(editBuilder => editBuilder.replace(
					new vscode.Position(editor.selection.active.line, 0),
					`namespace ${namespace};`
				));
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'phpClassGenerator.insertClass',
			async () => {
				if (!vscode.window.activeTextEditor) {
					return;
				}

				if (!vscode.workspace && !vscode.workspace.name) {
					vscode.window.showWarningMessage("You need to have a workspace open!");
					return;
				}

				let root = null;
				if (vscode.workspace.workspaceFolders) {
					root = vscode.workspace.workspaceFolders[0].uri.fsPath;
				}

				if (!root) {
					return;
				}

				let namespacePathSegments = vscode.window.activeTextEditor.document.fileName.split(path.sep);
				const name = namespacePathSegments.pop()?.replace('.php', '');
				namespacePathSegments = vscode.workspace.asRelativePath(namespacePathSegments.join(path.sep)).split(path.sep);

				let composerDocument = null;
				try {
					composerDocument = await vscode.workspace.openTextDocument(root + path.sep + 'composer.json');
				} catch (error) {
					console.error(error);
					vscode.window.showErrorMessage("Problem reading composer.json file!");
					return;
				}

				const namespaceResolver: NamespaceResolver = new ComposerNamespaceResolver(composerDocument.getText());
				const namespace = namespaceResolver.resolve(namespacePathSegments);

				if (!namespace) {
					vscode.window.showErrorMessage("Problem with resolving namespace!");
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

				const editor = vscode.window.activeTextEditor;
				editor.edit(editBuilder => editBuilder.replace(
					new vscode.Position(editor.selection.active.line, 0),
					generatePhpFileContent(
						{
							name: name ?? 'Uknown',
							type,
							namespace
						}
					)
				));
			}
		)
	);
}

export function deactivate() { }
