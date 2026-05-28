import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getRouteAssetUrls } from '../routeAssets'
import { preloadImages } from '../utils/preloadImages'

export function useDeferredRouteLocation() {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(null)

  useEffect(() => {
    let cancelled = false

    preloadImages(getRouteAssetUrls(location.pathname)).then(() => {
      if (!cancelled) {
        setDisplayLocation(location)
      }
    })

    return () => {
      cancelled = true
    }
  }, [location])

  return {
    displayLocation,
    isInitialLoading: displayLocation === null,
  }
}
