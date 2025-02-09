import { i18nRouter } from 'next-i18n-router';
import i18nConfig from '../i18nConfig';

export const middleware = (request: any) => i18nRouter(request, i18nConfig);

// only applies this middleware to files in the app directory
export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)'
};
