/**
 * you need to import the some interfaces
 */
import {
  DefineLocaleMessage,
  DefineDateTimeFormat,
  DefineNumberFormat,
} from "vue-i18n";
import en from "@/locales/en";

type LocaleMessage = typeof en;

declare module "vue-i18n" {
  // define the locale messages schema
  export interface DefineLocaleMessage extends LocaleMessage {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
