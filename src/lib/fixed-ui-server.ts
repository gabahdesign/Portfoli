import {getLocale} from "next-intl/server";
import {uiTranslator} from "./fixed-ui";
export async function getUiTranslator(){return uiTranslator(await getLocale());}
