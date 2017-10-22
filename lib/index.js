'use strict'
const assert = require('assert')
const equal = require('buffer-equal')
const fs = require('fs')
const minimatch = require('minimatch')
const path = require('path')
const recursive = require('recursive-readdir')
const utf8 = require('is-utf8')

module.exports = function (actualFolder, expectedFolder, comparers) {
  comparers = normalizeComparers(comparers)

  return Promise.all([recursive(actualFolder), recursive(expectedFolder)])
    .then(([actuals, expecteds]) => {
      let relActuals = relativize(actualFolder, actuals)
      let relExpecteds = relativize(expectedFolder, expecteds)
      assertFilestructure(relActuals, relExpecteds)
      return relActuals
    })
    .then(function (files) {
      files.forEach(f => assertContent(f, actualFolder, expectedFolder, comparers))
      return files
    })
}

const assertContent = function (rel, actualFolder, expectedFolder, comparers) {
  const actualPath = path.resolve(actualFolder, rel)
  const actualData = fs.readFileSync(actualPath)
  const expectedPath = path.resolve(expectedFolder, rel)
  const expectedData = fs.readFileSync(expectedPath)

  let activePattern = null
  let compareFn = defaultCompare
  for (let [pattern, fn] of comparers) {
    if (minimatch(rel, pattern)) {
      activePattern = pattern
      compareFn = fn
      break
    }
  }
  const status = compareFn(rel, actualPath, expectedPath, actualData, expectedData)
  if (status === undefined) return
  assert(status, `Pattern '${activePattern}' reported compare failure`)
}

const assertFilestructure = function (actuals, expecteds) {
  assert.deepEqual(
    actuals.sort(), expecteds.sort(),
    `Expected ${JSON.stringify(expecteds)} got ${JSON.stringify(actuals)}`
  )
}

const defaultCompare = (rel, actual, expected, actualData, expectedData) => {
  if (utf8(actualData) && utf8(expectedData)) {
    assert.equal(actualData.toString(), expectedData.toString())
  } else {
    assert(equal(actualData, expectedData))
  }
}

const normalizeComparers = function (comparers) {
  comparers = comparers || []
  for (let c of comparers) {
    assert.equal(c.length, 2, `Compare definition must be [pattern, function], got ${c}`)
  }
  return comparers
}

const relativize = function (from, tos) {
  return tos.map(f => path.relative(from, f))
}
