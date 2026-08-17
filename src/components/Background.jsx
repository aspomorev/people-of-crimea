import "./Background.css";

import defaultBackgroundImage from "../assets/background/фон.png";
import bluredBackgroundImage from "../assets/background/фон .png";
import cloudImage1 from "../assets/background/облако верхнее левое.png";
import cloudImage2 from "../assets/background/облако верхнее правое.png";
import cloudImage3 from "../assets/background/облако нижнее левое.png";
import cloudImage4 from "../assets/background/облако нижнее правое.png";
import parchmentBackground from "../assets/Фон пергамент.png";
import routeMapBackground from "../assets/background/route-map-background.png";
import { useMemo } from "react";
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

function Background({
  backgroundType = BACKGROUND_TYPE.MAP,
  showClouds = true,
  isCloudsBehind = false,
}) {
  const backgroundImage = useMemo(() => {
    switch (backgroundType) {
      case BACKGROUND_TYPE.MAP:
        return defaultBackgroundImage;
      case BACKGROUND_TYPE.BLURED_MAP:
        return bluredBackgroundImage;
      case BACKGROUND_TYPE.PARCHMENT:
        return parchmentBackground;
      case BACKGROUND_TYPE.ROUTE_MAP:
        return routeMapBackground;
    }
  }, [backgroundType]);

  return (
    <div className="background-content">
      <AbsoluteImage
        src={backgroundImage}
        className="background-image"
        width={1920}
        height={1080}
      />
      {showClouds && !isCloudsBehind ? <Clouds /> : null}
    </div>
  );
}

export default Background;
