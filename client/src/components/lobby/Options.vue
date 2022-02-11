<template>
  <div class="accordion w-75">
    <div class="accordion-item">

      <div id="form" class="accordion-collapse collapse hidden" aria-labelledby="options-heading" >
        <div class="accordion-body">
          <div class="d-flex flex-column align-items-center w-100 gap-4 px-4">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 w-100">
              <label for="timerDuration" class="form-label" v-t="'timerDurationLabel'"/>
              <input type="number" min="15" max="60" class="form-control" id="timerDuration" ref="timerDuration"
                     v-model="modelValue.promptTimer" @focusout="validateNum($event, 'promptTimer')">
              <label for="numRounds" class="form-label" v-t="'numRoundsLabel'"/>
              <input type="number" min="1" max="20" class="form-control" id="numRounds"
                     v-model="modelValue.numRounds" @focusout="validateNum($event, 'numRounds')">
            </div>
          </div>
        </div>
      </div>
      <h2 class="accordion-header" id="options-heading">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#form" aria-expanded="true" aria-controls="form">
          Game Options
        </button>
      </h2>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: Object
  },
  mounted() {
    const form = document.getElementById("form");
    const firstForm = this.$refs.timerDuration;
    form.addEventListener("shown.bs.collapse", function () {
      firstForm.focus();
    });
    this.modelValue.promptTimer = 35;
    this.modelValue.numRounds = 5;
  },
  methods: {
    validateNum(event, value) {
      const input = event.currentTarget;
      if(this.modelValue[value] > input.max){
        this.modelValue[value] = parseInt(input.max);
      } else if(this.modelValue[value] < input.min) {
        this.modelValue[value] = parseInt(input.min);
      }
    }
  }
}

</script>

<style scoped>


</style>