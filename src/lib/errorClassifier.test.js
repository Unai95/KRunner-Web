import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyRunIssue, systemFailure } from './errorClassifier.js';

describe('systemFailure', () => {
  it('classifies limit errors', () => {
    const result = systemFailure(new Error('LIMIT: demasiado grande'));
    assert.equal(result.errorKind, 'limit');
    assert.equal(result.systemError, 'demasiado grande');
  });
});

describe('classifyRunIssue', () => {
  it('detects compile errors', () => {
    assert.equal(classifyRunIssue({}, 'compiler said no', 1).label, 'Error de compilacion');
  });

  it('detects timeout exit code', () => {
    assert.equal(classifyRunIssue({ run: { code: 124 } }, '', 124).label, 'Tiempo excedido');
  });

  it('detects memory errors', () => {
    const issue = classifyRunIssue({ run: { stderr: 'java.lang.OutOfMemoryError: Java heap space' } }, '', 1);
    assert.equal(issue.label, 'Memoria excedida');
  });
});
