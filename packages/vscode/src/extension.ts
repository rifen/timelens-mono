import * as vscode from 'vscode';
import { DurationHoverProvider } from './provider/durationHover';
import { getSettings } from './config/settings';

let outputChannel: vscode.OutputChannel | undefined;

function log(...args: unknown[]) {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('TimeLens');
  }
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  outputChannel.appendLine(`[TimeLens] ${message}`);
}

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('TimeLens');
  log('Activating TimeLens extension');

  // Register hover provider for all languages (we filter in the provider)
  const selector: vscode.DocumentSelector = '*';

  const provider = new DurationHoverProvider((message: string, ...args: unknown[]) => {
    log(message, ...args);
  });
  const disposable = vscode.languages.registerHoverProvider(selector, provider);

  context.subscriptions.push(disposable);

  // Register a command to manually toggle (optional)
  const toggleCmd = vscode.commands.registerCommand('timelens.toggle', () => {
    const config = vscode.workspace.getConfiguration('timelens');
    const current = config.get('enabled', true);
    config.update('enabled', !current, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`TimeLens ${!current ? 'enabled' : 'disabled'}`);
  });

  context.subscriptions.push(toggleCmd);

  // Command to dump current settings to the TimeLens output channel
  const dumpSettingsCmd = vscode.commands.registerCommand('timelens.dumpSettings', () => {
    const settings = getSettings();
    log('=== Current Settings ===');
    for (const [key, value] of Object.entries(settings)) {
      log(`${key}:`, value);
    }
    log('=== End Settings ===');
    outputChannel?.show(true);
  });
  context.subscriptions.push(dumpSettingsCmd);

  // Command to log current hover target info
  const logHoverTargetCmd = vscode.commands.registerCommand('timelens.logHoverTarget', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      log('No active editor');
      outputChannel?.show(true);
      return;
    }
    const position = editor.selection.active;
    const lineText = editor.document.lineAt(position.line).text;
    log('=== Hover Target Info ===');
    log(`File: ${editor.document.fileName}`);
    log(`Line ${position.line}: "${lineText}"`);
    log(`Cursor at character: ${position.character}`);

    // Try to extract what the provider would detect
    const provider = new DurationHoverProvider((message: string, ...args: unknown[]) => {
      log(message, ...args);
    });
    provider.provideHover(editor.document, position, {} as vscode.CancellationToken);
    log('=== End Hover Target ===');
    outputChannel?.show(true);
  });
  context.subscriptions.push(logHoverTargetCmd);

  log('TimeLens extension activated successfully');
}

export function deactivate() {
  if (outputChannel) {
    outputChannel.dispose();
    outputChannel = undefined;
  }
}