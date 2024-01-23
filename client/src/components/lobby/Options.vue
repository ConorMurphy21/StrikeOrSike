<template>
  <div class="accordion w-75">
    <div class="accordion-item">
      <div id="form" class="accordion-collapse collapse hidden" aria-labelledby="options-heading">
        <div class="accordion-body">
          <form>
            <div class="row">
              <label v-t="'promptPacksLabel'" class="form-label" />
              <div v-for="(value, label, index) in options.packs" :key="label" class="col-md-auto">
                <input
                  :id="'pack' + index"
                  type="checkbox"
                  class="form-check-input"
                  :class="{ Disabled: disabled }"
                  :disabled="disabled"
                  :checked="value"
                  @click="packChange($event, label, index)" />
                <label :for="'pack' + index" class="form-check-label ms-2">{{ $t(`packLabels.${label}`) }}</label>
              </div>
            </div>
            <div class="row mt-2" :class="{ 'd-sm-none': disabled }">
              <div class="col-12">
                <label v-t="'customPromptsLabel'" for="customPrompts" class="form-label" />
                <textarea
                  id="customPrompts"
                  ref="customPrompts"
                  class="form-control fs-6"
                  :class="{ Disabled: !customSelected }"
                  :disabled="!customSelected"
                  :placeholder="$t('customPromptsPlaceholder')"
                  rows="3"
                  @focusout="customPromptsChange($event)" />
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-md-6">
                <label v-t="'timerDurationLabel'" for="timerDuration" class="form-label" />
                <input
                  id="timerDuration"
                  ref="timerDuration"
                  v-tooltip.left="$t('tooltip.options.timer')"
                  type="number"
                  min="15"
                  max="60"
                  class="form-control"
                  :class="{ Disabled: disabled }"
                  :disabled="disabled"
                  :value="options.promptTimer"
                  @focusout="validateNum($event, 'promptTimer')"
                  @change="onNumChange($event, 'promptTimer')" />
              </div>
              <div class="col-md-6">
                <label v-t="'numRoundsLabel'" for="numRounds" class="form-label" />
                <input
                  id="numRounds"
                  v-tooltip.right="$t('tooltip.options.rounds')"
                  type="number"
                  min="1"
                  max="20"
                  class="form-control"
                  :class="{ Disabled: disabled }"
                  :disabled="disabled"
                  :value="options.autoNumRounds ? players.length : options.numRounds"
                  @focusout="validateNumRounds($event)"
                  @change="onNumRoundChange($event)" />
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-md-6 d-flex justify-content-start align-items-center">
                <div class="form-check form-switch">
                  <label v-t="'sikeDisputeLabel'" for="sikeDispute" class="form-check-label" />
                  <input
                    id="sikeDispute"
                    v-tooltip.left="$t('tooltip.options.dispute')"
                    type="checkbox"
                    class="form-check-input"
                    :class="{ Disabled: disabled }"
                    :disabled="disabled"
                    :checked="options.sikeDispute"
                    @click="validateSikeDispute($event)" />
                </div>
              </div>
              <div class="col-md-6">
                <label v-t="'sikeRetriesLabel'" for="sikeRetries" class="form-label" />
                <input
                  id="sikeRetries"
                  v-tooltip.right="$t('tooltip.options.retries')"
                  type="number"
                  min="0"
                  max="2"
                  class="form-control"
                  :value="options.sikeRetries"
                  :class="{ Disabled: disabled || !options.sikeDispute }"
                  :disabled="disabled || !options.sikeDispute"
                  @focusout="validateNum($event, 'sikeRetries')"
                  @change="onNumChange($event, 'sikeRetries')" />
              </div>
            </div>
          </form>
        </div>
      </div>
      <h2 id="options-heading" class="accordion-header">
        <button
          class="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#form"
          aria-expanded="false"
          aria-controls="form">
          Game Options
        </button>
      </h2>
    </div>
  </div>
</template>

<script lang="ts">
import socket from '@/socket/socket';
import { useRoomStore } from '@/stores/room.js';
import { useGameStore } from '@/stores/game.js';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';

import { SettableOptions } from ':common/options';

type NumericKeyOfOptions = {
  [K in keyof SettableOptions]: SettableOptions[K] extends number ? K : never;
}[keyof SettableOptions];

export default defineComponent({
  props: {
    disabled: Boolean
  },
  data() {
    return {
      customSelected: false,
      tooltips: []
    };
  },
  computed: {
    ...mapState(useGameStore, ['options']),
    ...mapState(useRoomStore, ['players'])
  },
  mounted() {
    const form = document.getElementById('form') as HTMLFormElement;
    const firstForm = this.$refs.timerDuration as HTMLInputElement;
    form.addEventListener('shown.bs.collapse', () => {
      firstForm.focus();
    });
  },
  methods: {
    arraysEqual(a: string[], b: string[]) {
      return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
    },
    validateNumRounds(event: Event) {
      this.validateNum(event, 'numRounds', { autoNumRounds: false });
    },
    onNumRoundChange(event: Event) {
      this.onNumChange(event, 'numRounds', { autoNumRounds: false });
    },
    onNumChange(event: Event, label: NumericKeyOfOptions, options?: Partial<SettableOptions>) {
      const inputValue = parseInt((event.currentTarget! as HTMLInputElement).value);
      const actualValue = this.options[label];
      if (Math.abs(inputValue - actualValue) !== 0) {
        this.validateNum(event, label, options);
      }
    },
    validateNum(event: Event, label: NumericKeyOfOptions, options?: Partial<SettableOptions>) {
      const input = event.currentTarget! as HTMLInputElement;
      const inputValue = parseInt(input.value);
      const max = parseInt(input.max);
      const min = parseInt(input.min);
      let sanitizedVal;
      if (inputValue > max) {
        sanitizedVal = max;
      } else if (inputValue < min) {
        sanitizedVal = min;
      } else {
        sanitizedVal = inputValue;
      }
      if (sanitizedVal !== this.options[label]) {
        options = options ?? {};
        options[label] = sanitizedVal;
        socket.emit('setOptions', options);
      } else {
        input.value = String(this.options[label]);
      }
    },
    validateSikeDispute(event: Event) {
      const input = event.currentTarget! as HTMLInputElement;
      const options: Partial<SettableOptions> = {};
      options.sikeDispute = input.checked;
      if (!input.checked) {
        options.sikeRetries = 0;
      }
      socket.emit('setOptions', options);
    },
    packChange(event: Event, label: string, index: number) {
      const input = event.currentTarget! as HTMLInputElement;
      if (index === Object.keys(this.options.packs).length - 1) {
        this.customSelected = input.checked;
      }
      const packs = { ...this.options.packs };
      packs[label] = input.checked;
      const options = { packs: packs };
      socket.emit('setOptions', options);
    },
    customPromptsChange(input: Event) {
      const prompts = (input.currentTarget! as HTMLInputElement).value.split(/\r?\n/);
      if (!this.arraysEqual(prompts, this.options.customPrompts)) {
        const options = { customPrompts: prompts };
        socket.emit('setOptions', options);
      }
    }
  }
});
</script>
