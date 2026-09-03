import { createStore } from './createStore.js';

/** دامنه forms — state موقت فرم/مودال/پنل */
export const formsStore = createStore({
  giftCodeForm: { code: '', search: '', selected: [], validDays: 7 },
  buyerTicketFormOpen: false,
  addressFormOpen: false,
  addressForm: { title: 'خانه', receiver: '', phone: '', province: '', city: '', address: '', postal: '', isDefault: false, lat: 35.6997, lng: 51.3380, mapReady: false },
  contactForm: { name: '', phone: '', subject: '', message: '' },
  contactFormError: '',
  campaignForm: null,
  seoRedirectForm: { from: '', to: '', type: '301', note: '', editId: null },
  taxonomyForm: null,
  taxonomyFormOpen: false,
  shippingMethodFormOpen: false,
  shippingMethodForm: null,
  orderRateDraft: {},
  blogForm: null,
  catalogForm: null
});

export function patchForms(partial) {
  formsStore.setState((s) => ({ ...s, ...partial }));
}
