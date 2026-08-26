import "./Background.css";

import defaultBackgroundImage from "../assets/background/фон.png";
import bluredBackgroundImage from "../assets/background/фон .png";
import cloudImage1 from "../assets/background/облако верхнее левое.png";
import cloudImage2 from "../assets/background/облако верхнее правое.png";
import cloudImage3 from "../assets/background/облако нижнее левое.png";
import cloudImage4 from "../assets/background/облако нижнее правое.png";
import parchmentBackground from "../assets/Фон пергамент.png";
import routeMapBackground from "../assets/background/route-map-background.png";
import { useEffect, useRef, useState } from "react";
import AbsoluteImage from "./AbsoluteImage";

export const BACKGROUND_TYPE = {
  MAP: "map",
  BLURED_MAP: "blured_map",
  PARCHMENT: "parchment",
  ROUTE_MAP: "route_map",
};

export function Clouds() {
  return (
    <>
      <AbsoluteImage src={cloudImage1} className="cloud" top={0} left={0} />
      <AbsoluteImage src={cloudImage2} className="cloud" top={0} right={0} />
      <AbsoluteImage src={cloudImage3} className="cloud" bottom={0} left={0} />
      <AbsoluteImage src={cloudImage4} className="cloud" bottom={0} right={0} />
    </>
  );
}

function getBackgroundImage(backgroundType) {
  switch (backgroundType) {
    case BACKGROUND_TYPE.MAP:
      return defaultBackgroundImage;
    case BACKGROUND_TYPE.BLURED_MAP:
      return bluredBackgroundImage;
    case BACKGROUND_TYPE.PARCHMENT:
      return parchmentBackground;
    case BACKGROUND_TYPE.ROUTE_MAP:
      return routeMapBackground;
    default:
      return defaultBackgroundImage;
  }
}

function Background({
  backgroundType = BACKGROUND_TYPE.MAP,
  showClouds = true,
  isCloudsBehind = false,
}) {
  const backgroundImage = getBackgroundImage(backgroundType);
  const layerIdRef = useRef(0);
  const [layers, setLayers] = useState(() => [
    { id: 0, src: backgroundImage },
  ]);

  useEffect(() => {
    setLayers((prev) => {
      if (prev[prev.length - 1]?.src === backgroundImage) {
        return prev;
      }

      layerIdRef.current += 1;
      return [...prev, { id: layerIdRef.current, src: backgroundImage }];
    });
  }, [backgroundImage]);

  useEffect(() => {
    if (layers.length < 2) {
      return undefined;
    }

    const lastId = layers[layers.length - 1]?.id;
    const timeoutId = window.setTimeout(() => {
      setLayers((prev) => {
        const last = prev[prev.length - 1];
        if (last?.id !== lastId) {
          return prev;
        }

        return [last];
      });
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [layers]);

  const handleIncomingAnimationEnd = (layerId) => (event) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.animationName !== "background-fade-in") {
      return;
    }

    setLayers((prev) => {
      const last = prev[prev.length - 1];
      if (last?.id !== layerId) {
        return prev;
      }

      return [last];
    });
  };

  const showForegroundClouds = showClouds && !isCloudsBehind;

  return (
    <div className="background-content">
      {layers.map((layer, index) => {
        const isIncoming = index > 0;

        return (
          <div
            key={layer.id}
            className={`background-layer${isIncoming ? " background-layer_incoming" : ""}`}
            onAnimationEnd={isIncoming ? handleIncomingAnimationEnd(layer.id) : undefined}
          >
            <AbsoluteImage
              src={layer.src}
              className="background-image"
              width={1920}
              height={1080}
            />
          </div>
        );
      })}
      <div
        className={`background-clouds${showForegroundClouds ? " background-clouds_visible" : ""}`}
        aria-hidden={!showForegroundClouds}
      >
        <Clouds />
      </div>
    </div>
  );
}

export default Background;
