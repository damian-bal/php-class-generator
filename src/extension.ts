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
				if (!vscode.workspace) {
					vscode.window.showWarningMessage("You need to have a workspace open!");
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

				const root: string | null | undefined = vscode.workspace.getWorkspaceFolder(folder[0])?.uri.fsPath;

				if (!root) {
					vscode.window.showErrorMessage("Wrong folder!");
					return;
				}

				const composerJsonLocation = String(vscode.workspace
					.getConfiguration('phpClassGenerator')
					.get('composerJsonLocation'));

				const composerDir = path.dirname(composerJsonLocation) + path.sep;

				let composerDocument = null;
				try {
					composerDocument = await vscode.workspace.openTextDocument(root + path.sep + composerJsonLocation);
				} catch (error) {
					vscode.window.showErrorMessage("Problem reading composer.json file!");
					return;
				}

				if (!vscode.workspace.getWorkspaceFolder(folder[0])) {
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

				const namespacePathSegments = vscode.workspace.asRelativePath(folder[0].fsPath).split('/');

				if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders?.length > 1) {
					namespacePathSegments.splice(0, 1);
				}

				const namespaceResolver: NamespaceResolver = new ComposerNamespaceResolver(composerDocument.getText());
				const namespace = namespaceResolver.resolve(namespacePathSegments, composerDir);

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

				if (!vscode.workspace) {
					vscode.window.showWarningMessage("You need to have a workspace open!");
					return;
				}

				const root: string | null | undefined = vscode.workspace.getWorkspaceFolder(
					vscode.window.activeTextEditor.document.uri
				)?.uri.fsPath;

				if (!root) {
					vscode.window.showErrorMessage("Wrong folder!");
					return;
				}

				let namespacePathSegments = path.normalize(vscode.window.activeTextEditor.document.fileName).split(path.sep);
				namespacePathSegments.pop();
				namespacePathSegments = vscode.workspace.asRelativePath(namespacePathSegments.join(path.sep)).split('/');

				if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders?.length > 1) {
					namespacePathSegments.splice(0, 1);
				}

				const composerJsonLocation = String(vscode.workspace
					.getConfiguration('phpClassGenerator')
					.get('composerJsonLocation'));

				const composerDir = path.dirname(composerJsonLocation) + path.sep;

				let composerDocument = null;
				try {
					composerDocument = await vscode.workspace.openTextDocument(root + path.sep + composerJsonLocation);
				} catch (error) {
					console.error(error);
					vscode.window.showErrorMessage("Problem reading composer.json file!");
					return;
				}

				const namespaceResolver: NamespaceResolver = new ComposerNamespaceResolver(composerDocument.getText());
				const namespace = namespaceResolver.resolve(namespacePathSegments, composerDir);

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

				if (!vscode.workspace) {
					vscode.window.showWarningMessage("You need to have a workspace open!");
					return;
				}

				const root: string | null | undefined = vscode.workspace.getWorkspaceFolder(
					vscode.window.activeTextEditor.document.uri
				)?.uri.fsPath;

				if (!root) {
					vscode.window.showErrorMessage("Wrong folder!");
					return;
				}

				let namespacePathSegments = path.normalize(vscode.window.activeTextEditor.document.fileName).split(path.sep);
				const name = namespacePathSegments.pop()?.replace('.php', '');
				namespacePathSegments = vscode.workspace.asRelativePath(namespacePathSegments.join(path.sep)).split('/');

				if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders?.length > 1) {
					namespacePathSegments.splice(0, 1);
				}

				const composerJsonLocation = String(vscode.workspace
					.getConfiguration('phpClassGenerator')
					.get('composerJsonLocation'));

				const composerDir = path.dirname(composerJsonLocation) + path.sep;

				let composerDocument = null;
				try {
					composerDocument = await vscode.workspace.openTextDocument(root + path.sep + composerJsonLocation);
				} catch (error) {
					console.error(error);
					vscode.window.showErrorMessage("Problem reading composer.json file!");
					return;
				}

				const namespaceResolver: NamespaceResolver = new ComposerNamespaceResolver(composerDocument.getText());
				const namespace = namespaceResolver.resolve(namespacePathSegments, composerDir);

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
