export function normalize(value) {
  return String(value || '').replace(/\r\n/g, '\n').replace(/\s+$/g, '');
}

export function withAutoMain(source) {
  const code = String(source || '');
  if (/\bfun\s+main\s*\(/.test(code)) return code;

  const lines = code.replace(/\r\n/g, '\n').split('\n');
  const imports = [];
  const body = [];
  let stillReadingImports = true;

  for (const line of lines) {
    if (stillReadingImports && (/^\s*import\s+[\w.*]+/.test(line) || line.trim() === '')) {
      imports.push(line);
    } else {
      stillReadingImports = false;
      body.push(line);
    }
  }

  const indentedBody = body.length
    ? body.map((line) => line.trim() ? `    ${line}` : '').join('\n')
    : '    ';
  const prefix = imports.join('\n').trimEnd();
  const main = `fun main() {\n${indentedBody}\n}`;
  return prefix ? `${prefix}\n\n${main}` : main;
}

export function hasMainFunction(source) {
  return /\bfun\s+main\s*\(/.test(String(source || ''));
}

export function didPass(test, result) {
  if (!result || result.systemError) return false;
  const out = result.run?.stdout || '';
  const codeValue = typeof result.run?.code === 'number' ? result.run.code : null;
  const compErr = result.compile && result.compile.code !== 0;
  return normalize(out) === normalize(test.expected) && codeValue === 0 && !compErr;
}

export function progressFromResults(tests, results) {
  const passed = tests.filter((test) => didPass(test, results[test.id])).length;
  return {
    passed,
    total: tests.length,
    status: passed === tests.length ? 'solved' : passed > 0 ? 'partial' : 'pending',
    updatedAt: Date.now(),
  };
}

export function trimSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}
