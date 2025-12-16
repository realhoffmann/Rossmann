<script setup lang="ts">
import {useRouter} from 'vue-router';
import {useSettingsStore} from '../stores/settings';
import {useRossmannData} from '../composables/useRossmannData';

const router = useRouter();
const settings = useSettingsStore();
const {loading, progress, loadIfNeeded} = useRossmannData();

async function choose(mode: 'sample' | 'full') {
  if (loading.value) return; // guard double clicks
  settings.setMode(mode);
  try {
    await loadIfNeeded(mode === 'full');
    // small UX delay so progress/animation is visible
    await new Promise((r) => setTimeout(r, 120));
    router.push({name: 'overview'});
  } catch (err) {
    console.error('Load failed', err);
    // optionally show toast
  }
}
</script>

<template>
  <div class="layout-shell" style="min-height: 100vh; display: grid; place-items: center">
    <!-- replaced PrimeVue Card with a plain div to remove Card usage -->
    <div class="card-surface" style="max-width: 720px; width: 100%">
      <div class="flex align-items-center gap-3">
        <i class="pi pi-bolt" style="font-size: 2rem; color: #2563eb"></i>
        <div>
          <p class="pill" style="margin: 0">Rossmann Portal</p>
          <h2 style="margin: 0.25rem 0 0.25rem">Wähle dein Daten-Setup</h2>
          <p style="margin: 0; color: #475569">
            Entscheide dich für einen blitzschnellen Sample-Load oder den vollständigen Datensatz. Deine Auswahl wird
            gespeichert (LocalStorage) und die Daten werden im Browser abgelegt; spätere Besuche verwenden die
            gespeicherten Daten und laden nicht erneut.
          </p>
        </div>
      </div>

      <div class="grid" style="margin-top: 1.5rem">
        <div class="col-12 md:col-6">
          <div class="card-surface" style="background: linear-gradient(135deg, #e0f2fe, #eef2ff)">
            <h3 style="margin-top: 0">Sample (empfohlen für Speed)</h3>
            <ul style="padding-left: 1.2rem; color: #475569">
              <li>~25.000 Zeilen, lädt schnell</li>
              <li>Ideale UX für schnelles Explorieren</li>
            </ul>
            <Button :disabled="loading" label="Sample laden" icon="pi pi-bolt" severity="info" class="w-full"
                    @click="choose('sample')"></Button>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="card-surface" style="background: linear-gradient(135deg, #fef3c7, #fde68a)">
            <h3 style="margin-top: 0">Full Dataset</h3>
            <ul style="padding-left: 1.2rem; color: #475569">
              <li>1.0M+ Zeilen, maximale Genauigkeit</li>
              <li>Mehr Wartezeit, dafür komplette Insights</li>
            </ul>
            <Button :disabled="loading" label="Full laden" icon="pi pi-database" severity="warning" class="w-full"
                    @click="choose('full')"></Button>
          </div>
        </div>
      </div>
      <div v-if="loading" style="margin-top: 1rem; text-align: center; color: #475569">
        Lade Daten... {{ progress }}%
      </div>
    </div>
  </div>
</template>
