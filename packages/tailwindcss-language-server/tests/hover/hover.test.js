import { test, expect } from 'vitest'
import { withFixture } from '../common'

withFixture('basic', (c) => {
  async function testHover(name, { text, lang, position, expected, expectedRange, settings }) {
    test.concurrent(name, async () => {
      let textDocument = await c.openDocument({ text, lang, settings })
      let res = await c.sendRequest('textDocument/hover', {
        textDocument,
        position,
      })

      expect(res).toEqual(
        expected
          ? {
              contents: {
                language: 'css',
                value: expected,
              },
              range: expectedRange,
            }
          : expected
      )
    })
  }

  testHover('disabled', {
    text: '<div class="bg-red-500">',
    settings: {
      tailwindCSS: { hovers: false },
    },
    expected: null,
  })

  testHover('hover', {
    text: '<div class="bg-red-500">',
    position: { line: 0, character: 13 },
    expected:
      '& {\n' +
      '  --tw-bg-opacity: 1;\n' +
      '  background-color: rgb(239 68 68 / var(--tw-bg-opacity));\n' +
      '}',
    expectedRange: {
      start: { line: 0, character: 12 },
      end: { line: 0, character: 22 },
    },
  })

  testHover('arbitrary value', {
    text: '<div class="p-[3px]">',
    position: { line: 0, character: 13 },
    expected: '& {\n' + '  padding: 3px;\n' + '}',
    expectedRange: {
      start: { line: 0, character: 12 },
      end: { line: 0, character: 19 },
    },
  })

  testHover('arbitrary value with theme function', {
    text: '<div class="p-[theme(spacing.4)]">',
    position: { line: 0, character: 13 },
    expected: '& {\n' + '  padding: 1rem/* 16px */;\n' + '}',
    expectedRange: {
      start: { line: 0, character: 12 },
      end: { line: 0, character: 32 },
    },
  })

  testHover('arbitrary property', {
    text: '<div class="[text-wrap:balance]">',
    position: { line: 0, character: 13 },
    expected: '& {\n' + '  text-wrap: balance;\n' + '}',
    expectedRange: {
      start: { line: 0, character: 12 },
      end: { line: 0, character: 31 },
    },
  })

  testHover('disable simplified hovers', {
    text: '<div class="[[data-important]_&]:bg-purple-300">',
    position: { line: 0, character: 13 },
    settings: {
      tailwindCSS: { simplifyHovers: false },
    },
    expected:
      '[data-important] .\\[\\[data-important\\]_\\&\\]\\:bg-purple-300 {\n' +
      '  --tw-bg-opacity: 1;\n' +
      '  background-color: rgb(216 180 254 / var(--tw-bg-opacity));\n' +
      '}',
    expectedRange: {
      start: { line: 0, character: 12 },
      end: { line: 0, character: 46 },
    },
  })
})
