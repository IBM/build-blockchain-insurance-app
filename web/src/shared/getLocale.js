import { Cookies } from 'react-cookie';

const supportedLocales = ['en', 'en-US', 'de', 'de-DE', 'de-AT', 'de-CH'];

const cookies = new Cookies();

export default function getLocale() {
  // Cookies have priority over browser and defaults
  const appLangCookie = cookies.get('applang');
  const suggestedLocale = appLangCookie || (window.navigator ? window.navigator.language : 'en');

  if (supportedLocales.includes(suggestedLocale)) {
    return suggestedLocale;
  } else {
    return 'en';
  }
}
