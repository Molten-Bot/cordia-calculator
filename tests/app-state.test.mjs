import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  addItem,
  clearDoneItems,
  createDefaultState,
  parseStoredState,
  removeItem,
  updateItem,
} from "../public/app.js";

test("createDefaultState uses supplied id factory", () => {
  let nextId = 1;
  const state = createDefaultState(() => `item-${nextId++}`);

  assert.deepEqual(
    state.items.map((item) => item.id),
    ["item-1", "item-2", "item-3"],
  );
});

test("parseStoredState merges valid stored values with defaults", () => {
  const defaultState = createDefaultState(() => "default-id");
  const stored = JSON.stringify({
    appName: "Typed Cordia",
    theme: "dark",
    items: [{ id: "stored-id", text: "Stored item", done: true }],
  });

  assert.deepEqual(parseStoredState(stored, defaultState), {
    appName: "Typed Cordia",
    theme: "dark",
    items: [{ id: "stored-id", text: "Stored item", done: true }],
  });
});

test("parseStoredState falls back when stored JSON is invalid", () => {
  const defaultState = createDefaultState(() => "default-id");

  assert.equal(parseStoredState("{", defaultState), defaultState);
});

test("item reducers add, update, remove, and clear items immutably", () => {
  const state = {
    appName: "Cordia",
    theme: "system",
    items: [
      { id: "one", text: "One", done: false },
      { id: "two", text: "Two", done: true },
    ],
  };

  const added = addItem(state, "Three", () => "three");
  const updated = updateItem(added, "one", { done: true });
  const removed = removeItem(updated, "two");
  const cleared = clearDoneItems(removed);

  assert.deepEqual(added.items[0], { id: "three", text: "Three", done: false });
  assert.equal(state.items[0].done, false);
  assert.deepEqual(
    cleared.items,
    [{ id: "three", text: "Three", done: false }],
  );
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
