<template xmlns="http://www.w3.org/1999/html">
  <div class="accordion w-75">
    <div class="accordion-item">

      <div id="form" class="accordion-collapse collapse hidden" aria-labelledby="options-heading">
        <div class="accordion-body">
          <form>
            <div class="row">
              <div class="col-md-6">
                <label for="timerDuration" class="form-label" v-t="'timerDurationLabel'"/>
                <input type="number" min="15" max="60" class="form-control" :class="{'Disabled': disabled}"
                       :disabled="disabled" id="timerDuration" ref="timerDuration" :value="options.promptTimer"
                       data-bs-toggle="tooltip" data-bs-placement="left" :title="$t('tooltip.options.timer')"
                       @focusout="validateNum($event, 'promptTimer')"
                       @change="onNumChange($event, 'promptTimer')">
              </div>
              <div class="col-md-6">
                <label for="numRounds" class="form-label" v-t="'numRoundsLabel'"/>
                <input type="number" min="1" max="20" class="form-control" :class="{'Disabled': disabled}"
                       :disabled="disabled" id="numRounds"
                       :value="(options.autoNumRounds) ? players.length : options.numRounds"
                       data-bs-toggle="tooltip" data-bs-placement="right" :title="$t('tooltip.options.rounds')"
                       @focusout="validateNumRounds($event)"
                       @change="onNumRoundChange($event, 'numRounds')">
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-md-6 d-flex justify-content-center align-items-center">
                <div class="form-check form-switch">
                  <label for="sikeDispute" class="form-check-label" v-t="'sikeDisputeLabel'"/>
                  <input type="checkbox" class="form-check-input" :class="{'Disabled': disabled}" :disabled="disabled"
                         id="sikeDispute" :checked="options.sikeDispute"
                         data-bs-toggle="tooltip" data-bs-placement="left" :title="$t('tooltip.options.dispute')"
                         @click="validateSikeDispute($event, 'sikeDispute')">
                </div>
              </div>
              <div class="col-md-6">
                <label for="sikeRetries" class="form-label" v-t="'sikeRetriesLabel'"/>
                <input type="number" min="0" max="2" class="form-control" id="sikeRetries" :value="options.sikeRetries"
                       :class="{'Disabled': disabled || !options.sikeDispute}"
                       :disabled="disabled || !options.sikeDispute"
                       data-bs-toggle="tooltip" data-bs-placement="right" :title="$t('tooltip.options.retries')"
                       @focusout="validateNum($event, 'sikeRetries')"
                       @change="onNumChange($event, 'sikeRetries')">
              </div>
            </div>
<!--            <hr class="bg-blue border-2 border-top border-blue">-->
            <div class="row mt-2">
              <label class="form-label" v-t="'promptPacksLabel'"/>
              <div v-for="(value, label) in options.packs" class="col-md-auto">
                <input type="checkbox" class="form-check-input" :class="{'Disabled': disabled}"
                       :disabled="disabled" :id="label" :checked="value" @click="packChange($event, label)">
                <label :for="label" class="form-check-label ms-2">{{ $tm('packLabels')[label] }}</label>
              </div>
            </div>
            <div class="row mt-2 d-none d-sm-block" :class="{'d-sm-none': disabled}">
              <div class="col-12">
                <label for="customPrompts" class="form-label" v-t="'customPromptsLabel'"/>
                <textarea class="form-control fs-6" id="customPrompts"
                          :placeholder="$t('customPromptsPlaceholder')" rows="3"/>
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
import {createNamespacedHelpers} from 'vuex';
import {Tooltip} from 'bootstrap';

const game = createNamespacedHelpers('game')
const room = createNamespacedHelpers('room')

export default {
  props: {
    disabled: Boolean,
  },
  computed: {
    ...game.mapState([
      'options'
    ]),
    ...room.mapState([
      'players'
    ])
  },
  mounted() {
    const form = document.getElementById('form');
    const firstForm = this.$refs.timerDuration;
    form.addEventListener('shown.bs.collapse', function () {
      firstForm.focus();
    });

    //inti tooltip
    Array.from(document.querySelectorAll('input[data-bs-toggle="tooltip"]'))
        .forEach(tooltipNode => new Tooltip(tooltipNode, {delay: {show: 500, hide: 50}}));
  },
  methods: {
    validateNumRounds(event) {
      this.validateNum(event, 'numRounds', {autoNumRounds: false});
    },
    onNumRoundChange(event) {
      this.onNumChange(event, 'numRounds', {autoNumRounds: false});
    },
    onNumChange(event, label, options) {
      const inputValue = parseInt(event.currentTarget.value);
      const actualValue = this.options[label];
      if(Math.abs(inputValue - actualValue) === 1){
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
        this.$socket.emit('setOptions', options);
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
      this.$socket.emit('setOptions', options);
    },
    packChange(event, label) {
      const input = event.currentTarget;
      const packs = {...this.options.packs};
      packs[label] = input.checked;
      const options = {packs: packs}
      this.$socket.emit('setOptions', options);
    }
  }
}
</script>
