"use client";
import {useLocale} from "next-intl";
import {uiTranslator} from "./fixed-ui";
export function useUiTranslation(){return uiTranslator(useLocale());}
