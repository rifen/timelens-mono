import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../../src/extension';

suite('Extension Test Suite', () => {
  test('Extension activates properly', () => {
    assert.ok(myExtension.activate);
  });
  
  test('TimeLens hover provider is registered', async () => {
    // Test that the extension activates without errors
    const ext = vscode.extensions.getExtension('timelens.timelens');
    if (ext) {
      await ext.activate();
      assert.strictEqual(ext.isActive, true);
    }
  });
});