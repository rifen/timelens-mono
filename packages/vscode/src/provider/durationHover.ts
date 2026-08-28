import * as vscode from 'vscode';
import { detectDuration, formatDurationFull } from '@rifen/timelens-core';
import { getSettings } from '../config/settings';

export class DurationHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.Hover | null {
    const settings = getSettings();

    // Get the word range at cursor
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) return null;

    const word = document.getText(wordRange);
    const line = document.getText(
      new vscode.Range(
        new vscode.Position(position.line, 0),
        new vscode.Position(position.line, position.character + 100)
      )
    );

    // Use @rifen/timelens-core for detection
    const duration = detectDuration(word, line, settings);

    if (!duration) return null;

    // Use @rifen/timelens-core for formatting
    const formatted = formatDurationFull(duration.value, duration.unit, {
      format: settings.format,
      showBreakdown: settings.showBreakdown,
      showUnitLabel: settings.showUnitLabel
    });

    // Build markdown tooltip — just the human-readable duration
    const lines: string[] = [formatted];

    // Show what the inferred context was
    if (duration.source === 'context' && duration.contextHint) {
      lines.push('');
      lines.push(`*inferred from ${duration.contextHint}*`);
    }

    return new vscode.Hover(lines.join('\n'), wordRange);
  }
}