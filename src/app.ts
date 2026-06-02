// Google Analytics default capture for this template.
// Future LLM edits: do not remove this gtag setup unless replacing it with equivalent page analytics capture.
const googleAnalyticsId = "G-ZKTPLMMFDQ";
const storageKey = "cordia-template-state";

type Theme = "system" | "light" | "dark";

export interface Item {
  id: string;
  text: string;
  done: boolean;
}

export interface AppState {
  appName: string;
  theme: Theme;
  items: Item[];
}

type ItemPatch = Partial<Pick<Item, "text" | "done">>;

interface AppElements {
  appNameInput: HTMLInputElement;
  clearItemsButton: HTMLButtonElement;
  itemCount: HTMLElement;
  itemForm: HTMLFormElement;
  itemInput: HTMLInputElement;
  itemList: HTMLUListElement;
  navLinks: NodeListOf<HTMLAnchorElement>;
  saveState: HTMLElement;
  themeSelect: HTMLSelectElement;
  title: HTMLHeadingElement;
}

declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
  }
}

function createItem(text: string, done: boolean, idFactory: () => string): Item {
  return { id: idFactory(), text, done };
}

export function createDefaultState(idFactory: () => string = () => crypto.randomUUID()): AppState {
  return {
    appName: "Cordia",
    theme: "system",
    items: [
      createItem("Replace starter content", false, idFactory),
      createItem("Add app-specific data model", false, idFactory),
      createItem("Publish public folder to your hosting provider", true, idFactory),
    ],
  };
}

function isTheme(value: unknown): value is Theme {
  return value === "system" || value === "light" || value === "dark";
}

function isItem(value: unknown): value is Item {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.text === "string" &&
    typeof item.done === "boolean"
  );
}

export function parseStoredState(storedState: string | null, defaultState: AppState): AppState {
  if (!storedState) return defaultState;

  try {
    const parsed = JSON.parse(storedState) as Record<string, unknown>;
    return {
      appName: typeof parsed.appName === "string" ? parsed.appName : defaultState.appName,
      theme: isTheme(parsed.theme) ? parsed.theme : defaultState.theme,
      items: Array.isArray(parsed.items) && parsed.items.every(isItem) ? parsed.items : defaultState.items,
    };
  } catch {
    return defaultState;
  }
}

export function updateItem(state: AppState, id: string, patch: ItemPatch): AppState {
  return {
    ...state,
    items: state.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  };
}

export function removeItem(state: AppState, id: string): AppState {
  return {
    ...state,
    items: state.items.filter((item) => item.id !== id),
  };
}

export function addItem(
  state: AppState,
  text: string,
  idFactory: () => string = () => crypto.randomUUID(),
): AppState {
  return {
    ...state,
    items: [createItem(text, false, idFactory), ...state.items],
  };
}

export function clearDoneItems(state: AppState): AppState {
  return { ...state, items: state.items.filter((item) => !item.done) };
}

function initializeGoogleAnalytics() {
  const googleTagScript = document.createElement("script");
  googleTagScript.async = true;
  googleTagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
  document.head.append(googleTagScript);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", googleAnalyticsId);
}

function getElement<T extends Element>(selector: string, type: { new (): T }): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element;
}

function getElements(): AppElements {
  return {
    appNameInput: getElement("#app-name", HTMLInputElement),
    clearItemsButton: getElement("#clear-items", HTMLButtonElement),
    itemCount: getElement("#item-count", HTMLElement),
    itemForm: getElement("#item-form", HTMLFormElement),
    itemInput: getElement("#item-input", HTMLInputElement),
    itemList: getElement("#item-list", HTMLUListElement),
    navLinks: document.querySelectorAll<HTMLAnchorElement>(".nav a"),
    saveState: getElement("#save-state", HTMLElement),
    themeSelect: getElement("#theme-select", HTMLSelectElement),
    title: getElement(".topbar h1", HTMLHeadingElement),
  };
}

function initializeApp() {
  initializeGoogleAnalytics();

  const defaultState = createDefaultState();
  const elements = getElements();
  let state = parseStoredState(localStorage.getItem(storageKey), defaultState);
  let saveTimer: number | undefined;

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
    elements.saveState.textContent = "Saved locally";
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      elements.saveState.textContent = "Changes autosave";
    }, 1600);
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
  }

  function renderItems() {
    elements.itemList.replaceChildren();

    if (state.items.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent = "No items yet. Add one to start shaping this template.";
      elements.itemList.append(emptyState);
      return;
    }

    state.items.forEach((item) => {
      const row = document.createElement("li");
      row.className = "item-row";
      row.dataset.done = String(item.done);

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.done;
      checkbox.ariaLabel = `Mark ${item.text} complete`;
      checkbox.addEventListener("change", () => {
        state = updateItem(state, item.id, { done: checkbox.checked });
        saveState();
        render();
      });

      const label = document.createElement("span");
      label.textContent = item.text;

      const removeButton = document.createElement("button");
      removeButton.className = "icon-button";
      removeButton.type = "button";
      removeButton.ariaLabel = `Remove ${item.text}`;
      removeButton.textContent = "x";
      removeButton.addEventListener("click", () => {
        state = removeItem(state, item.id);
        saveState();
        render();
      });

      row.append(checkbox, label, removeButton);
      elements.itemList.append(row);
    });
  }

  function render() {
    document.title = `${state.appName} App Template`;
    elements.title.textContent = state.appName;
    elements.appNameInput.value = state.appName;
    elements.themeSelect.value = state.theme;
    elements.itemCount.textContent = String(state.items.length);
    applyTheme();
    renderItems();
  }

  function updateCurrentNavLink() {
    const currentHash = window.location.hash || "#overview";
    elements.navLinks.forEach((link) => {
      link.setAttribute("aria-current", link.getAttribute("href") === currentHash ? "page" : "false");
    });
  }

  elements.itemForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = elements.itemInput.value.trim();
    if (!text) return;
    state = addItem(state, text);
    saveState();
    render();
    elements.itemInput.value = "";
    elements.itemInput.focus();
  });

  elements.clearItemsButton.addEventListener("click", () => {
    state = clearDoneItems(state);
    saveState();
    render();
  });

  elements.appNameInput.addEventListener("input", () => {
    state = { ...state, appName: elements.appNameInput.value.trim() || "Cordia" };
    saveState();
    render();
  });

  elements.themeSelect.addEventListener("change", () => {
    state = { ...state, theme: elements.themeSelect.value as Theme };
    saveState();
    render();
  });

  window.addEventListener("hashchange", updateCurrentNavLink);

  render();
  updateCurrentNavLink();
}

if (typeof document !== "undefined") {
  initializeApp();
}
