<template>
  <div class="accordion w-75">
    <div class="accordion-item">

      <div id="form" class="accordion-collapse collapse hidden" aria-labelledby="options-heading">
        <div class="accordion-body">
          <form>
            <div class="row">
              <label class="form-label" v-t="'promptPacksLabel'"/>
              <div v-for="(value, label, index) in options.packs" class="col-md-auto">
                <input v-if="index !== options.packs.length-1" type="checkbox" class="form-check-input"
                       :class="{'Disabled': disabled}"
                       :disabled="disabled" :id="'pack' + index" :ref="'pack' + index" :checked="value"
                       @click="packChange($event, label, index)">
                <label :for="'pack' + index" class="form-check-label ms-2">{{ $tm('packLabels')[label] }}</label>
              </div>
            </div>
            <div class="row mt-2" :class="{'d-sm-none': disabled}">
              <div class="col-12">
                <label for="customPrompts" class="form-label" v-t="'customPromptsLabel'"/>
                <textarea class="form-control fs-6" :class="{'Disabled': !customSelected}" :disabled="!customSelected"
                          id="customPrompts" ref="customPrompts" @focusout="customPromptsChange($event.currentTarget.value)"
                          :placeholder="$t('customPromptsPlaceholder')" rows="3"/>
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-md-6">
                <label for="timerDuration" class="form-label" v-t="'timerDurationLabel'"/>
                <input type="number" min="15" max="60" class="form-control" :class="{'Disabled': disabled}"
                       :disabled="disabled" id="timerDuration" ref="timerDuration" :value="options.promptTimer"
                       v-tooltip.left="$t('tooltip.options.timer')"
                       @focusout="validateNum($event, 'promptTimer')"
                       @change="onNumChange($event, 'promptTimer')">
              </div>
              <div class="col-md-6">
                <label for="numRounds" class="form-label" v-t="'numRoundsLabel'"/>
                <input type="number" min="1" max="20" class="form-control" :class="{'Disabled': disabled}"
                       :disabled="disabled" id="numRounds"
                       :value="(options.autoNumRounds) ? players.length : options.numRounds"
                       v-tooltip.right="$t('tooltip.options.rounds')"
                       @focusout="validateNumRounds($event)"
                       @change="onNumRoundChange($event, 'numRounds')">
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-md-6 d-flex justify-content-start align-items-center">
                <div class="form-check form-switch">
                  <label for="sikeDispute" class="form-check-label" v-t="'sikeDisputeLabel'"/>
                  <input type="checkbox" class="form-check-input" :class="{'Disabled': disabled}" :disabled="disabled"
                         id="sikeDispute" :checked="options.sikeDispute"
                         v-tooltip.left="$t('tooltip.options.dispute')"
                         @click="validateSikeDispute($event, 'sikeDispute')">
                </div>
              </div>
              <div class="col-md-6">
                <label for="sikeRetries" class="form-label" v-t="'sikeRetriesLabel'"/>
                <input type="number" min="0" max="2" class="form-control" id="sikeRetries" :value="options.sikeRetries"
                       :class="{'Disabled': disabled || !options.sikeDispute}"
                       :disabled="disabled || !options.sikeDispute"
                       v-tooltip.right="$t('tooltip.options.retries')"
                       @focusout="validateNum($event, 'sikeRetries')"
                       @change="onNumChange($event, 'sikeRetries')">
              </div>
            </div>
          </form>
        </div>
      </div>
      <h2 class="accordion-header" id="options-heading">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#form"
                aria-expanded="false" aria-controls="form">
          Game Options
        </button>
      </h2>
    </div>
  </div>
</template>

<script>
import socket from '@/socket/socket';
import { useRoomStore } from '@/stores/room.ts';
import { useGameStore } from '@/stores/game.ts';
import { mapState } from 'pinia';

export default {
  data() {
    return {
      customSelected: 0,
      tooltips: []
    }
  },
  props: {
    disabled: Boolean,
  },
  computed: {
    ...mapState(useGameStore, [
      'options'
    ]),
    ...mapState(useRoomStore, [
      'players'
    ]),
  },
  mounted() {
    const form = document.getElementById('form');
    form.addEventListener('shown.bs.collapse', () => {
      if (!this.$refs.pack0) return;
      const firstForm = this.$refs.pack0[0];
      firstForm.focus();
    });
  },
  methods: {
    arraysEqual(a, b) {
      return Array.isArray(a) &&
          Array.isArray(b) &&
          a.length === b.length &&
          a.every((val, index) => val === b[index]);
    },
    validateNumRounds(event) {
      this.validateNum(event, 'numRounds', {autoNumRounds: false});
    },
    onNumRoundChange(event) {
      this.onNumChange(event, 'numRounds', {autoNumRounds: false});
    },
    onNumChange(event, label, options) {
      const inputValue = parseInt(event.currentTarget.value);
      const actualValue = this.options[label];
      if (Math.abs(inputValue - actualValue) !== 0) {
        this.validateNum(event, label, options);
      }
    },
    validateNum(event, label, options) {
      const input = event.currentTarget;
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
        input.value = this.options[label];
      }
    },
    validateSikeDispute(event, label) {
      const input = event.currentTarget;
      const options = {};
      options[label] = input.checked;
      if (!input.checked) {
        options['sikeRetries'] = 0;
      }
      socket.emit('setOptions', options);
    },
    packChange(event, label, index) {
      const input = event.currentTarget;
      if(index === Object.keys(this.options.packs).length - 1){
        this.customSelected = input.checked;
      }
      const packs = {...this.options.packs};
      packs[label] = input.checked;
      const options = {packs: packs};
      socket.emit('setOptions', options);
    },
    customPromptsChange(input) {
      const prompts = input.split(/\r?\n/);
      if (!this.arraysEqual(prompts, this.options.customPrompts)) {
        const options = {customPrompts: prompts};
        socket.emit('setOptions', options);
      }
    },
  }
}
</script>
