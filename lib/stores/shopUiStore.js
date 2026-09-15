import { createStore } from './createStore.js';

/** state محلی باقی‌مانده فروشگاه / ناوبری / checkout / پروفایل */
export const shopUiStore = createStore({ enabled: true, logos: { light: ["public/Pirrahanmardane-logo.webp", "public/blue_w_bg.webp"] }, widthRatio: 0.18, marginRatio: 0.035 });

export function patchShopUi(partial) {
  shopUiStore.setState((s) => ({ ...s, ...partial }));
}
