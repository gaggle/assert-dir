/* global describe, it, afterEach */
'use strict'
const assert = require('assert')
const mock = require('mock-fs')

const assertDir = require('../lib/index')

describe('assert-dir', function () {
  afterEach(() => mock.restore())

  it('accepts identical folders', function () {
    mock({'path1/subfolder': {'file': ''}, 'path2/subfolder': {'file': ''}})
    return assertDir('path1', 'path2')
  })

  it('accepts identical binary content', function () {
    mock({
      'path1': {'file': Buffer.alloc(1)},
      'path2': {'file': Buffer.alloc(1)}
    })
    return assertDir('path1', 'path2')
  })

  it('throws if structure differs', function () {
    mock({'path1': {'file': ''}, 'path2': {}})
    return assertDir('path1', 'path2')
      .then(error)
      .catch(err => assertInstanceOf(err, assert.AssertionError))
  })

  it('throws if content differs', function () {
    mock({'path1': {'file': 'foo'}, 'path2': {'file': 'bar'}})
    return assertDir('path1', 'path2')
      .then(error)
      .catch(err => assertInstanceOf(err, assert.AssertionError))
  })

  it('can match file to a custom comparer', function () {
    mock({'path1': {'file': 'foo'}, 'path2': {'file': ''}})
    return assertDir('path1', 'path2', [['*', () => true]])
  })

  it('falls back to default comparer', function () {
    mock({'path1': {'file': ''}, 'path2': {'file': ''}})
    return assertDir('path1', 'path2', [['foo', () => false]])
  })

  it('matches patterns in order given', function () {
    mock({'path1': {'file': 'foo'}, 'path2': {'file': ''}})
    return assertDir('path1', 'path2', [['file', () => true], ['*', () => false]])
  })
})

const error = function () { throw new Error('was not supposed to succeed') }

const assertInstanceOf = function (actual, type) {
  assert(actual instanceof type, `Expected ${type.name}, got '${actual}'`)
}
