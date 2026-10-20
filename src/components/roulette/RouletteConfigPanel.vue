<template>
  <!-- Panel teleportado al body para evitar z-index issues, sin overlay que bloquee clicks -->
  <Teleport to="body">
    <!-- Panel lateral -->
    <Transition name="slide-right">
      <div
        v-if="isOpen"
        class="fixed inset-y-0 right-0 z-50 w-full sm:max-w-sm flex flex-col gap-0 overflow-hidden backdrop-blur-2xl bg-card/95 border-l border-border shadow-2xl"
      >
        <!-- Header -->
        <div class="px-5 pt-5 pb-3 border-b border-border flex items-start justify-between">
          <div>
            <h2 class="text-base text-foreground font-bold">Configuración</h2>
            <p class="text-xs text-muted-foreground mt-0.5">Parámetros de la ruleta.</p>
          </div>
          <button
            @click="closePanel"
            class="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Contenido scrolleable -->
        <ScrollArea class="flex-1 overflow-y-auto">
          <div class="flex flex-col gap-4 px-5 py-4">
            <!-- Modo de la Ruleta -->
            <div class="space-y-2">
              <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Modo de la Ruleta
              </h3>
              <div class="grid grid-cols-2 gap-2">
                <button
                  @click="$emit('mode-change', 'numbers')"
                  class="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg border transition-all cursor-pointer"
                  :class="
                    !isNamesMode
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : 'bg-muted/30 text-muted-foreground border-input/50 hover:bg-muted/50 hover:text-foreground'
                  "
                >
                  <Hash class="h-3 w-3" />
                  Números
                </button>
                <button
                  @click="$emit('mode-change', 'names')"
                  class="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg border transition-all cursor-pointer"
                  :class="
                    isNamesMode
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : 'bg-muted/30 text-muted-foreground border-input/50 hover:bg-muted/50 hover:text-foreground'
                  "
                >
                  <Users class="h-3 w-3" />
                  Participantes
                </button>
              </div>
            </div>

            <Separator />

            <!-- Agregar Participante -->
            <div class="space-y-2">
              <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Agregar Participante
              </h3>

              <template v-if="namesMultiline">
                <textarea
                  ref="nameInputRef"
                  v-model="newName"
                  @keydown.ctrl.enter.prevent="handleAddFromInput"
                  placeholder="Nombre por línea... (Ctrl+Enter para agregar)"
                  class="w-full rounded-md bg-transparent border border-input p-3 min-h-20 text-xs resize-y focus:border-ring outline-none"
                  rows="4"
                />
              </template>

              <template v-else>
                <Input
                  ref="nameInputRef"
                  v-model="newName"
                  placeholder="Nombre..."
                  class="w-full text-xs h-8"
                  @keyup.enter="handleAddFromInput"
                />
              </template>

              <div class="flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  class="text-xs h-7 px-3"
                  :disabled="!newName.trim()"
                  @click="handleAddFromInput"
                >
                  Agregar
                </Button>
                <div class="flex items-center gap-2">
                  <Label class="text-[10px] text-muted-foreground">Multilínea</Label>
                  <Switch v-model="namesMultiline" class="scale-75" />
                </div>
              </div>
            </div>

            <Separator />

            <!-- Lista de Participantes -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Participantes
                </h3>
                <Badge variant="secondary" class="text-[10px] font-mono px-2 py-0.5">
                  {{ itemCount }}
                </Badge>
              </div>

              <div v-if="itemCount === 0" class="text-center py-6 text-muted-foreground">
                <Users class="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p class="text-xs">No hay participantes</p>
                <p class="text-[11px]">Agrega al menos 2 para usar la ruleta</p>
              </div>

              <ScrollArea v-else class="h-56">
                <div class="flex flex-col gap-1 pr-2">
                  <div
                    v-for="(item, index) in items"
                    :key="index"
                    class="flex items-center gap-2 bg-muted/30 border border-input/50 rounded-md px-2 py-2 text-xs hover:bg-muted/50 transition-colors"
                  >
                    <button
                      type="button"
                      class="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-border shadow-inner flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
                      :style="{ backgroundColor: item.backgroundColor }"
                      :title="'Color de ' + item.label"
                      @click="openNativeColorPicker(index)"
                    >
                      <div
                        class="absolute inset-0 pointer-events-none rounded-full border border-white/20"
                      ></div>
                    </button>
                    <input
                      :ref="
                        (el) => {
                          if (el) colorInputRefs[index] = el as HTMLInputElement;
                        }
                      "
                      type="color"
                      :value="item.backgroundColor"
                      @input="onColorInput($event, index)"
                      class="sr-only"
                      tabindex="-1"
                    />
                    <span class="flex-1 truncate text-foreground font-medium">{{
                      item.label
                    }}</span>
                    <button
                      @click="handleRemoveItem(index)"
                      class="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all px-1.5 py-1 rounded cursor-pointer"
                      :title="'Eliminar ' + item.label"
                    >
                      <Trash2 class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </ScrollArea>

              <Button
                v-if="itemCount > 0"
                variant="destructive"
                size="sm"
                class="w-full text-xs h-7 bg-destructive text-destructive-foreground font-semibold transition-all hover:bg-berry-500 hover:scale-[1.01] active:scale-95"
                @click="handleClearAll"
              >
                <Trash2 class="h-3 w-3 mr-1 text-white stroke-[2.5]" /> Limpiar lista ({{
                  itemCount
                }})
              </Button>
            </div>

            <Separator />

            <!-- Texto y Alineación -->
            <Accordion type="single" collapsible>
              <AccordionItem value="text-align" class="border-0">
                <AccordionTrigger
                  class="text-xs font-bold text-muted-foreground uppercase tracking-wider py-0 hover:no-underline"
                >
                  Texto y Alineación
                </AccordionTrigger>
                <AccordionContent class="pt-3 flex flex-col gap-3">
                  <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1">
                      <Label class="text-[11px] text-muted-foreground">Alineación</Label>
                      <Select v-model="settings.labelAlign">
                        <SelectTrigger class="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="right">Exterior</SelectItem>
                          <SelectItem value="left">Centro</SelectItem>
                          <SelectItem value="center">Medio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div class="space-y-1">
                      <Label class="text-[11px] text-muted-foreground">Radio Texto</Label>
                      <Input
                        v-model.number="settings.labelRadius"
                        type="number"
                        :min="0.1"
                        :max="0.95"
                        step="0.05"
                        class="text-xs h-8"
                      />
                    </div>
                  </div>

                  <div class="space-y-1">
                    <Label class="text-[11px] text-muted-foreground">Tamaño Máx.</Label>
                    <Input
                      v-model.number="settings.fontSizeMax"
                      type="number"
                      :min="8"
                      :max="60"
                      class="text-xs h-8"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator />

            <!-- Parámetros Giro -->
            <Accordion type="single" collapsible>
              <AccordionItem value="spin-params" class="border-0">
                <AccordionTrigger
                  class="text-xs font-bold text-muted-foreground uppercase tracking-wider py-0 hover:no-underline"
                >
                  Parámetros Giro
                </AccordionTrigger>
                <AccordionContent class="pt-3 flex flex-col gap-3">
                  <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1">
                      <Label class="text-[11px] text-muted-foreground">Ancho Líneas</Label>
                      <Input
                        v-model.number="settings.lineWidth"
                        type="number"
                        :min="0"
                        :max="20"
                        class="text-xs h-8"
                      />
                    </div>
                    <div class="space-y-1">
                      <Label class="text-[11px] text-muted-foreground">Color Borde</Label>
                      <input
                        type="color"
                        v-model="settings.lineColor"
                        class="w-full h-8 rounded cursor-pointer border border-input bg-transparent"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1">
                      <Label class="text-[11px] text-muted-foreground">Duración (ms)</Label>
                      <Input
                        v-model.number="settings.spinDuration"
                        type="number"
                        :min="1000"
                        :max="15000"
                        step="250"
                        class="text-xs h-8"
                      />
                    </div>
                    <div class="space-y-1">
                      <Label class="text-[11px] text-muted-foreground">Vueltas mín. (≥ 8)</Label>
                      <Input
                        v-model.number="settings.revolutions"
                        type="number"
                        :min="8"
                        :max="30"
                        class="text-xs h-8"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator />

            <!-- JSON & Backup -->
            <Accordion type="single" collapsible>
              <AccordionItem value="json-tools" class="border-0">
                <AccordionTrigger
                  class="text-xs font-bold text-muted-foreground uppercase tracking-wider py-0 hover:no-underline"
                >
                  JSON & Backup
                </AccordionTrigger>
                <AccordionContent class="pt-3 flex flex-col gap-3">
                  <div class="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" class="text-xs h-8" @click="exportConfig">
                      <Download class="h-3 w-3 mr-1" /> Exportar
                    </Button>
                    <label
                      class="inline-flex items-center justify-center gap-1 text-xs h-8 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                    >
                      <Upload class="h-3 w-3" /> Cargar
                      <input type="file" accept=".json" class="hidden" @change="handleImport" />
                    </label>
                  </div>

                  <div class="space-y-2">
                    <Label class="text-[11px] text-muted-foreground">Editar JSON Directo</Label>
                    <Textarea
                      v-model="jsonText"
                      class="w-full h-32 text-[11px] font-mono resize-y"
                      placeholder='[{"label":"NOMBRE","backgroundColor":"#0f5132","labelColor":"#f5f1e8"}]'
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      class="text-xs h-8 w-full"
                      @click="loadFromJson"
                    >
                      Cargar desde JSON
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { toast } from "vue-sonner";
import { Download, Upload, Users, Trash2, X, Hash } from "@lucide/vue";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useRouletteConfig } from "@/composables/useRouletteConfig";

const {
  items,
  settings,
  addItem,
  removeItem,
  updateItemColor,
  clearItems,
  setItems,
  exportConfig,
  importConfig,
} = useRouletteConfig();

const props = defineProps({
  isNamesMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["items-changed", "update:open", "mode-change"]);

const isOpen = ref(false);
const newName = ref("");
const namesMultiline = ref(true);
const jsonText = ref("[]");
const nameInputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);

// Color picker native logic
const colorInputRefs = ref<Record<number, HTMLInputElement>>({});

function openNativeColorPicker(index: number) {
  const input = colorInputRefs.value[index];
  if (input) {
    input.showPicker();
  }
}

function onColorInput(event: Event, index: number) {
  const color = (event.target as HTMLInputElement).value;
  updateItemColor(index, color);
}

const itemCount = computed(() => items.value.length);

function togglePanel() {
  isOpen.value = !isOpen.value;
  emit("update:open", isOpen.value);
}

function closePanel() {
  if (!isOpen.value) return;
  isOpen.value = false;
  emit("update:open", false);
}

watch(isOpen, (val) => {
  emit("update:open", val);
});

watch(
  () => [...items.value],
  (current) => {
    jsonText.value = JSON.stringify(current, null, 2);
  },
  { deep: true, immediate: true },
);

function handleRemoveItem(index: number) {
  removeItem(index);
}

function handleClearAll() {
  clearItems();
  toast.success("Lista limpiada");
}

function handleAddFromInput() {
  const raw = newName.value.trim();
  if (!raw) return;

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let added = 0;
  let skipped = 0;

  for (const line of lines) {
    const exists = items.value.some((i) => i.label.toUpperCase() === line.toUpperCase());
    if (exists) {
      skipped++;
    } else {
      addItem(line);
      added++;
    }
  }

  if (added > 0) {
    toast.success(
      added === 1 ? `"${lines[0].toUpperCase()} agregado"` : `${added} participantes agregados`,
    );
    emit("items-changed");
  }
  if (skipped > 0) {
    toast.error(skipped === 1 ? "Ese nombre ya existe" : `${skipped} nombres ya existían`);
  }

  newName.value = "";
}

const handleImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const ok = await importConfig(file);
  if (ok) {
    toast.success("Configuración importada");
    emit("items-changed");
  } else {
    toast.error("Archivo JSON no válido");
  }
  (event.target as HTMLInputElement).value = "";
};

function loadFromJson() {
  try {
    const parsed = JSON.parse(jsonText.value);
    if (Array.isArray(parsed) && parsed.length >= 2) {
      setItems(parsed);
      toast.success("JSON cargado");
      emit("items-changed");
    } else if (Array.isArray(parsed) && parsed.length < 2) {
      toast.error("Se necesitan al menos 2 ítems");
    } else {
      toast.error("El JSON debe ser un array");
    }
  } catch {
    toast.error("JSON inválido");
  }
}

function focusInput() {
  nextTick(() => {
    const el = nameInputRef.value;
    if (el && typeof el.focus === "function") el.focus();
  });
}

defineExpose({
  isOpen,
  focusInput,
  toggle: togglePanel,
  open: () => {
    isOpen.value = true;
    emit("update:open", true);
  },
  close: closePanel,
});
</script>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0%);
}

input[type="color"] {
  color-scheme: dark;
}
</style>
