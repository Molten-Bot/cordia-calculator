import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createDefaultState,
  evaluateExpression,
  parseStoredHistory,
  pressCalculatorKey,
} from "../public/app.js";

test("evaluateExpression handles operator precedence and parentheses", () => {
  assert.equal(evaluateExpression("2+3*4"), "14");
  assert.equal(evaluateExpression("(2+3)*4"), "20");
});

test("evaluateExpression handles powers, percent, and unary minus", () => {
  assert.equal(evaluateExpression("2^3"), "8");
  assert.equal(evaluateExpression("50%"), "0.5");
  assert.equal(evaluateExpression("-4+10"), "6");
});

test("evaluateExpression handles roots, logs, trig, and constants", () => {
  assert.equal(evaluateExpression("sqrt(81)+log(100)"), "11");
  assert.equal(evaluateExpression("sin(pi/2)"), "1");
  assert.equal(evaluateExpression("ln(e)"), "1");
});

test("evaluateExpression supports calculator-style shorthand", () => {
  assert.equal(evaluateExpression("sqrt(81"), "9");
  assert.equal(evaluateExpression("2π"), "6.28318530718");
  assert.equal(evaluateExpression("2(3+4)"), "14");
});

test("pressCalculatorKey builds expressions and stores bounded history", () => {
  let state = createDefaultState();
  for (const key of ["1", "2", "+", "7", "equals"]) {
    state = pressCalculatorKey(state, key);
  }

  assert.equal(state.display, "19");
  assert.deepEqual(state.history, ["12+7 = 19"]);

  state = pressCalculatorKey(state, "*");
  state = pressCalculatorKey(state, "2");
  state = pressCalculatorKey(state, "equals");

  assert.equal(state.display, "38");
  assert.deepEqual(state.history.slice(0, 2), ["19*2 = 38", "12+7 = 19"]);
});

test("parseStoredHistory returns only string history entries", () => {
  assert.deepEqual(parseStoredHistory(JSON.stringify(["1+1 = 2", 42, null])), ["1+1 = 2"]);
  assert.deepEqual(parseStoredHistory("{"), []);
});

test("served files do not reference disallowed providers or tooling", async () => {
  const servedFiles = [
    "public/app.js",
    "public/humans.txt",
    "public/index.html",
    "public/llm.txt",
  ];

  for (const file of servedFiles) {
    const content = await readFile(file, "utf8");
    assert.doesNotMatch(content, /\bgit\b|cloudflare/i, file);
  }
});
