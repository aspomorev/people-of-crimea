import { matchPath } from 'react-router-dom'

export const APP_ROUTE_PATHS = [
  '/',
  '/timeline',
  '/modern-ethnicity',
  '/routes',
  '/routes/history/:people',
  '/routes/history/:people/:title',
  '/routes/map/:people',
  '/routes/map/:people/:city',
]

export function isValidAppRoute(pathname) {
  return APP_ROUTE_PATHS.some((path) => matchPath({ path, end: true }, pathname))
}

export function getBackPathname(pathname) {
  const segments = pathname.split('/').filter(Boolean)

  while (segments.length > 0) {
    segments.pop()
    const candidate = segments.length ? `/${segments.join('/')}` : '/'

    if (isValidAppRoute(candidate)) {
      return candidate
    }
  }

  return '/'
}
