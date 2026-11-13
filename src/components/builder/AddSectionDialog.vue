<script setup lang="ts">
/**
 * @file AddSectionDialog.vue
 * @description Modale per l'aggiunta di nuove sezioni nella pagina vetrina dell'ambassador.
 * @author Vasile Chifeac (AI Agent)
 */

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'add-section', type: 'profile' | 'articles' | 'products' | 'actionBanner'): void;
}>();

const selectType = (type: 'profile' | 'articles' | 'products' | 'actionBanner') => {
  emit('add-section', type);
  emit('update:modelValue', false);
};
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    transition-show="scale"
    transition-hide="scale"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card style="width: 580px; max-width: 95vw" class="rounded-borders overflow-hidden">
      <q-toolbar class="bg-primary text-white q-py-sm">
        <q-icon name="add_circle" size="24px" class="q-mr-sm" />
        <q-toolbar-title class="text-subtitle1 text-weight-bold">
          Aggiungi Nuova Sezione alla Pagina
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section class="q-pa-md">
        <div class="text-caption text-grey-8 q-mb-md">
          Scegli il tipo di blocco da inserire. Potrai personalizzarne contenuti, testi e posizione in qualsiasi momento.
        </div>

        <div class="column q-gutter-y-sm">
          <!-- 0. Profilo, Chi Sono & Filosofia -->
          <q-card
            flat
            bordered
            class="cursor-pointer hover-scale transition-easy q-pa-md row items-center justify-between"
            @click="selectType('profile')"
          >
            <div class="row items-center q-gutter-md">
              <q-avatar color="primary" text-color="white" icon="person" size="44px" />
              <div>
                <div class="text-subtitle1 text-weight-bold text-primary">Profilo, Chi Sono & Filosofia</div>
                <div class="text-caption text-grey-7">
                  Sezione biografia, storia del salone o citazione con stile tipografico, allineamento e grassetto personalizzabili.
                </div>
              </div>
            </div>
            <q-icon name="chevron_right" size="24px" color="grey-6" />
          </q-card>

          <!-- 1. Carosello Articoli -->
          <q-card
            flat
            bordered
            class="cursor-pointer hover-scale transition-easy q-pa-md row items-center justify-between"
            @click="selectType('articles')"
          >
            <div class="row items-center q-gutter-md">
              <q-avatar color="primary" text-color="white" icon="view_carousel" size="44px" />
              <div>
                <div class="text-subtitle1 text-weight-bold text-primary">Carosello Articoli & Storie</div>
                <div class="text-caption text-grey-7">
                  Carosello dinamico per testimonianze prima/dopo, storie cliniche o consigli di bellezza.
                </div>
              </div>
            </div>
            <q-icon name="chevron_right" size="24px" color="grey-6" />
          </q-card>

          <!-- 2. Griglia Prodotti -->
          <q-card
            flat
            bordered
            class="cursor-pointer hover-scale transition-easy q-pa-md row items-center justify-between"
            @click="selectType('products')"
          >
            <div class="row items-center q-gutter-md">
              <q-avatar color="primary" text-color="white" icon="grid_view" size="44px" />
              <div>
                <div class="text-subtitle1 text-weight-bold text-primary">Griglia Prodotti</div>
                <div class="text-caption text-grey-7">
                  Vetrina catalogo prodotti con foto, prezzo, recensioni e ordine immediato WhatsApp.
                </div>
              </div>
            </div>
            <q-icon name="chevron_right" size="24px" color="grey-6" />
          </q-card>

          <!-- 3. Banner Promozionale -->
          <q-card
            flat
            bordered
            class="cursor-pointer hover-scale transition-easy q-pa-md row items-center justify-between"
            @click="selectType('actionBanner')"
          >
            <div class="row items-center q-gutter-md">
              <q-avatar color="primary" text-color="white" icon="smart_button" size="44px" />
              <div>
                <div class="text-subtitle1 text-weight-bold text-primary">Banner Promozionale / Azione</div>
                <div class="text-caption text-grey-7">
                  Pillola promozionale con bottone d'azione per sconti, contatti WhatsApp o trattamenti.
                </div>
              </div>
            </div>
            <q-icon name="chevron_right" size="24px" color="grey-6" />
          </q-card>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-sm bg-grey-1">
        <q-btn flat label="Annulla" color="grey-7" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.transition-easy {
  transition: all 0.2s ease;
}

.hover-scale:hover {
  transform: translateY(-2px);
  border-color: var(--q-primary, #341414);
  box-shadow: 0 4px 12px rgba(52, 20, 20, 0.1);
}
</style>

