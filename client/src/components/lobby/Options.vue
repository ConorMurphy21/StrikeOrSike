<template>
  <div class="accordion w-75">
    <div class="accordion-item">

      <div id="form" class="accordion-collapse collapse hidden" aria-labelledby="options-heading">
        <div class="accordion-body">
          <div class="d-flex flex-column align-items-center w-100 gap-4 px-4">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 w-100">
              <label for="timerDuration" class="form-label" v-t="'timerDurationLabel'"/>
              <input type="number" min="15" max="60" class="form-control" :class="{'Disabled': disabled}" id="timerDuration" ref="timerDuration"
                     :value="options.promptTimer" @focusout="validateNum($event, 'promptTimer')" :disabled="disabled">
              <label for="numRounds" class="form-label" v-t="'numRoundsLabel'" />
              <input type="number" min="1" max="20" class="form-control" :class="{'Disabled': disabled}" id="numRounds"
                     :value="(options.autoNumRounds) ? players.length : options.numRounds"
                     @focusout="validateNumRounds($event)" :disabled="disabled">
            </div>
          </div>
        </div>
      </div>
      <h2 class="accordion-header" id="options-heading">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#form"
                aria-expanded="true" aria-controls="form">
          Game Options
        </button>
      </h2>
    </div>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const game = createNamespacedHelpers('game')
const room = createNamespacedHelpers('room')

export default {
  props: {
    disabled: Boolean
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
  },
  methods: {
    validateNumRounds(event) {
      const options = {...this.options};
      options.autoNumRounds = false;
      this.validateNum(event, 'numRounds', options);
    },
    validateNum(event, value, options) {
      options = options ?? {...this.options};
      const input = event.currentTarget;
      const inputValue = parseInt(input.value);
      const max = parseInt(input.max);
      const min = parseInt(input.min);
      if (inputValue > max) {
        options[value] = max;
      } else if (inputValue < min) {
        options[value] = min;
      } else {
        options[value] = inputValue;
      }
      if(this.options[value] !== options[value]) {
        this.$socket.emit('setOptions', options);
      } else {
        input.value = options[value];
      }
    }
  }
}

</script>

<style scoped>


</style>