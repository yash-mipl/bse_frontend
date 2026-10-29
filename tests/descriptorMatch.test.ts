import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  isAutoOpenDescriptor,
  normalizeDescriptor,
} from '../src/utils/descriptorMatch.ts'

describe('descriptor matching', () => {
  it('matches Outcome Of The Board Meeting', () => {
    assert.equal(isAutoOpenDescriptor('Outcome Of The Board Meeting'), true)
  })

  it('matches Outcome Of Board Meeting', () => {
    assert.equal(isAutoOpenDescriptor('Outcome Of Board Meeting'), true)
  })

  it('matches Outcome Of  Board Meeting (extra spaces)', () => {
    assert.equal(isAutoOpenDescriptor('Outcome Of  Board Meeting'), true)
  })

  it('matches Financial Results', () => {
    assert.equal(isAutoOpenDescriptor('Financial Results'), true)
  })

  it('is case-insensitive', () => {
    assert.equal(isAutoOpenDescriptor('financial results'), true)
    assert.equal(isAutoOpenDescriptor('OUTCOME OF BOARD MEETING'), true)
  })

  it('trims whitespace', () => {
    assert.equal(isAutoOpenDescriptor('  Financial Results  '), true)
  })

  it('collapses repeated whitespace', () => {
    assert.equal(isAutoOpenDescriptor('Financial   Results'), true)
    assert.equal(normalizeDescriptor('Outcome  Of   Board Meeting'), 'outcome of board meeting')
  })

  it('rejects removed and unrelated descriptors', () => {
    assert.equal(isAutoOpenDescriptor('Newspaper Publication'), false)
    assert.equal(isAutoOpenDescriptor('Press Release'), false)
    assert.equal(isAutoOpenDescriptor('Press Release / Media Release'), false)
    assert.equal(isAutoOpenDescriptor('Media Release'), false)
    assert.equal(isAutoOpenDescriptor('Board Meeting'), false)
    assert.equal(isAutoOpenDescriptor('General'), false)
    assert.equal(isAutoOpenDescriptor('Analyst / Investor Meet'), false)
    assert.equal(isAutoOpenDescriptor('Financial'), false)
    assert.equal(isAutoOpenDescriptor('Results'), false)
    assert.equal(isAutoOpenDescriptor(''), false)
  })
})
