import { ref, watch } from "vue";
import {
  NOEL_CANDY_BG,
  NOEL_CANDY_LABEL,
  NOEL_CANDY_RED,
  NOEL_LABEL_CREAM,
} from "@/lib/noel-palette";

const STORAGE_KEY = "roulette-config";
const CONFIG_VERSION = 3;

export interface RouletteItem {
  label: string;
  backgroundColor: string;
  labelColor: string;
}

export interface RouletteSettings {
  fontFamily: string;
  labelAlign: "right" | "left" | "center";
  fontSizeMax: number;
  labelRadius: number;
  lineWidth: number;
  lineColor: string;
  spinDuration: number;
  revolutions: number;
}

const DEFAULT_SETTINGS: RouletteSettings = {
  fontFamily: '"Outfit Variable", Arial, sans-serif',
  labelAlign: "right",
  fontSizeMax: 40,
  labelRadius: 0.6,
  lineWidth: 6,
  lineColor: "#000000",
  spinDuration: 4500,
  revolutions: 8,
};

// Singleton
const items = ref<RouletteItem[]>([]);
const settings = ref<RouletteSettings>({ ...DEFAULT_SETTINGS });
let initialized = false;

function sortItems() {
  items.value.sort((a, b) => {
    const aIsNum = /^\d/.test(a.label);
    const bIsNum = /^\d/.test(b.label);
    if (aIsNum && !bIsNum) return 1;
    if (!aIsNum && bIsNum) return -1;
    return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
  });
}

// Caramelo por posición: al agregar, el siguiente color del ciclo
// rojo/crema para que la lista nazca alternada.
function getCandySlot(index: number): number {
  return index % NOEL_CANDY_BG.length;
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.items && Array.isArray(parsed.items)) {
      items.value = parsed.items;
      sortItems();
    }
    if (parsed.settings) {
      settings.value = { ...DEFAULT_SETTINGS, ...parsed.settings };
      // Migración v3: números grandes + borde negro sin borrar la lista
      // ni el resto de ajustes del usuario.
      if (parsed.version !== CONFIG_VERSION) {
        settings.value.fontSizeMax = DEFAULT_SETTINGS.fontSizeMax;
        settings.value.lineColor = DEFAULT_SETTINGS.lineColor;
      }
    }
  } catch {
    // ignore corrupt data
  }
}

function saveConfig() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: CONFIG_VERSION,
      items: items.value,
      settings: settings.value,
    }),
  );
}

export function useRouletteConfig() {
  if (!initialized) {
    initialized = true;
    loadConfig();
    watch([items, settings], saveConfig, { deep: true });
  }

  const addItem = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return false;
    const slot = getCandySlot(items.value.length);
    items.value.push({
      label: trimmed.toUpperCase(),
      backgroundColor: NOEL_CANDY_BG[slot] ?? NOEL_CANDY_RED,
      labelColor: NOEL_CANDY_LABEL[slot] ?? NOEL_LABEL_CREAM,
    });
    sortItems();
    return true;
  };

  const removeItem = (index: number) => {
    items.value.splice(index, 1);
  };

  const updateItemColor = (index: number, color: string) => {
    if (items.value[index]) {
      items.value[index].backgroundColor = color;
    }
  };

  const clearItems = () => {
    items.value = [];
  };

  const setItems = (newItems: RouletteItem[]) => {
    items.value = newItems;
    sortItems();
  };

  const exportConfig = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ items: items.value, settings: settings.value }, null, 2));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `ruleta-config-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const importConfig = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (imported.items && imported.settings) {
            items.value = imported.items;
            settings.value = { ...DEFAULT_SETTINGS, ...imported.settings };
            sortItems();
            resolve(true);
          } else if (Array.isArray(imported)) {
            items.value = imported;
            sortItems();
            resolve(true);
          } else {
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  };

  return {
    items,
    settings,
    addItem,
    removeItem,
    updateItemColor,
    clearItems,
    setItems,
    exportConfig,
    importConfig,
  };
}
