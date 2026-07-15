import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getAllAssetUrls } from '../routeAssets'
import { preloadImages } from '../utils/preloadImages'

let assetsPreloadPromise = null

function ensureAssetsPreloaded() {
  if (!assetsPreloadPromise) {
    assetsPreloadPromise = preloadImages(getAllAssetUrls())
  }

  return assetsPreloadPromise
}

export function useDeferredRouteLocation() {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(null)
  const [assetsReady, setAssetsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    ensureAssetsPreloaded().then(() => {
      if (!cancelled) {
        setAssetsReady(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!assetsReady) {
      return
    }

    setDisplayLocation(location)
  }, [location, assetsReady])

  return {
    displayLocation,
    isInitialLoading: !assetsReady,
  }
}
