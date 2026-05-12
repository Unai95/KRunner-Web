import Editor from '@monaco-editor/react';

export function KotlinEditor({ code, theme, onChange, onRun }) {
  return (
    <div className="monaco-wrap">
      <Editor
        value={code}
        language="kotlin"
        theme={theme === 'light' ? 'vs' : 'vs-dark'}
        onChange={(value) => onChange(value || '')}
        options={{
          fontFamily: 'JetBrains Mono, Cascadia Code, Consolas, monospace',
          fontSize: 13,
          lineHeight: 21,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          tabSize: 4,
          automaticLayout: true,
          wordWrap: 'on',
          padding: { top: 14, bottom: 14 },
        }}
        onMount={(editor, monaco) => {
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onRun);
        }}
      />
    </div>
  );
}
