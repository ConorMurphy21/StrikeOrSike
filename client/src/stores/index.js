import { PiniaLogger } from 'pinia-logger';
import { createPinia } from 'pinia';

const pinia = createPinia();

pinia.use(
  PiniaLogger({
    disabled: process.env.NODE_ENV === 'production'
  })
);

export default pinia;
