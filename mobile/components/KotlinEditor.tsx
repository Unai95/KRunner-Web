import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { Theme } from '../constants/colors';

interface KotlinEditorProps {
  code: string;
  theme: Theme;
  onChange: (code: string) => void;
  onRun?: () => void;
  height?: number;
}

function buildHtml(initialCode: string, monacoTheme: string): string {
  const escaped = JSON.stringify(initialCode);
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
    #editor { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="editor"></div>
  <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.53.0/min/vs/loader.js"></script>
  <script>
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.53.0/min/vs' } });
    require(['vs/editor/editor.main'], function() {
      var editor = monaco.editor.create(document.getElementById('editor'), {
        value: ${escaped},
        language: 'kotlin',
        theme: '${monacoTheme}',
        fontSize: 13,
        lineHeight: 21,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'off',
        tabSize: 4,
        automaticLayout: true,
        padding: { top: 10, bottom: 10 },
        renderLineHighlight: 'line',
        scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 }
      });

      editor.onDidChangeModelContent(function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'change',
          code: editor.getValue()
        }));
      });

      window.addEventListener('message', function(e) {
        try {
          var msg = JSON.parse(e.data);
          if (msg.type === 'setValue' && msg.code !== editor.getValue()) {
            editor.setValue(msg.code);
          }
          if (msg.type === 'setTheme') {
            monaco.editor.setTheme(msg.theme);
          }
        } catch {}
      });
    });
  </script>
</body>
</html>`;
}

export function KotlinEditor({ code, theme, onChange, onRun, height = 280 }: KotlinEditorProps) {
  const webviewRef = useRef<WebView>(null);
  const monacoTheme = theme === 'light' ? 'vs' : 'vs-dark';
  const lastCodeRef = useRef(code);
  const htmlRef = useRef(buildHtml(code, monacoTheme));

  useEffect(() => {
    if (lastCodeRef.current !== code) {
      lastCodeRef.current = code;
      webviewRef.current?.injectJavaScript(
        `window.postMessage(${JSON.stringify(JSON.stringify({ type: 'setValue', code }))}, '*'); true;`
      );
    }
  }, [code]);

  useEffect(() => {
    webviewRef.current?.injectJavaScript(
      `window.postMessage(${JSON.stringify(JSON.stringify({ type: 'setTheme', theme: monacoTheme }))}, '*'); true;`
    );
  }, [monacoTheme]);

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'change') {
        lastCodeRef.current = msg.code;
        onChange(msg.code);
      }
    } catch {}
  }

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webviewRef}
        source={{ html: htmlRef.current }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        keyboardDisplayRequiresUserAction={false}
        style={styles.webview}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
