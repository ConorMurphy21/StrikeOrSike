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
                       id="timerDuration" ref="timerDuration"
                       data-bs-toggle="tooltip" data-bs-placement="left" :title="$t('tooltip.options.timer')"
                       :value="options.promptTimer" @focusout="validateNum($event, 'promptTimer')" :disabled="disabled">
              </div>
              <div class="col-md-6">
                <label for="numRounds" class="form-label" v-t="'numRoundsLabel'"/>
                <input type="number" min="1" max="20" class="form-control" :class="{'Disabled': disabled}"
                       id="numRounds"
                       data-bs-toggle="tooltip" data-bs-placement="right" :title="$t('tooltip.options.rounds')"
                       :value="(options.autoNumRounds) ? players.length : options.numRounds"
                       @focusout="validateNumRounds($event)" :disabled="disabled">
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 d-flex justify-content-start align-items-center">
                <div class="form-check form-switch">
                  <label for="sikeDispute" class="form-check-label" v-t="'sikeDisputeLabel'"/>
                  <input type="checkbox" class="form-check-input" :class="{'Disabled': disabled}" :disabled="disabled"
                         id="sikeDispute"
                         data-bs-toggle="tooltip" data-bs-placement="left" :title="$t('tooltip.options.dispute')"
                         :checked="options.sikeDispute" @click="validateSikeDispute($event, 'sikeDispute')">
                </div>
              </div>
              <div class="col-md-6">
                <label for="sikeRetries" class="form-label" v-t="'sikeRetriesLabel'"/>
                <input type="number" min="0" max="2" class="form-control"
                       data-bs-toggle="tooltip" data-bs-placement="right" :title="$t('tooltip.options.retries')"
                       :class="{'Disabled': disabled || !options.sikeDispute}" id="sikeRetries"
                       :value="options.sikeRetries" @focusout="validateNum($event, 'sikeRetries')"
                       :disabled="disabled || !options.sikeDispute">
              </div>
            </div>
            <div class="row mt-2">
              <label class="form-label" v-t="'promptPacksLabel'"/>
              <div v-for="(value, label) in options.packs" class="col-md-auto">
                <input type="checkbox" class="form-check-input" :class="{'Disabled': disabled}" :disabled="disabled"
                       :id="label"
                       :checked="value">
                <label :for="label" class="form-check-label ms-2">{{$tm('packLabels')[label]}}</label>
              </div>
            </div>
            <div class="row mt-2" :class="{'d-none': disabled}">
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
    validateNum(event, value, options) {
      const input = event.currentTarget;
      const inputValue = parseInt(input.value);
      const max = parseInt(input.max);
      const min = parseInt(input.min);
      let val;
      if (inputValue > max) {
        val = max;
      } else if (inputValue < min) {
        val = min;
      } else {
        val = inputValue;
      }
      if (val !== this.options[value]) {
        options = options ?? {};
        options[value] = val;
        this.$socket.emit('setOptions', options);
      } else {
        input.value = options[value];
      }
    },
    validateSikeDispute(event, value) {
      const input = event.currentTarget;
      let options = {};
      options[value] = input.checked;
      if (!input.checked) {
        options['sikeRetries'] = 0;
      }
      if (this.options[value] !== options[value]) {
        this.$socket.emit('setOptions', options);
      }
    }
  }
}
</script>
