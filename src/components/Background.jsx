import "./Background.css";

import defaultBackgroundImage from "../assets/background/фон (Крым и море).png";
import bluredBackgroundImage from "../assets/background/фон .png";
import cloudImage1 from "../assets/background/облако верхнее левое.png";
import cloudImage2 from "../assets/background/облако верхнее правое.png";
import cloudImage3 from "../assets/background/облако нижнее левое.png";
import cloudImage4 from "../assets/background/облако нижнее правое.png";
import DivImage from "./DivImage";
import parchmentBackground from "../assets/Фон пергамент.png";
import { useMemo } from "react";
import AbsoluteImage from "./AbsoluteImage";

const logoModules = import.meta.glob("../assets/logo/*", {
  eager: true,
  import: "default",
});

const logos = Object.values(logoModules);

export const BACKGROUND_TYPE = {
  MAP: "map",
  BLURED_MAP: "blured_map",
  PARCHMENT: "parchment",
};
function Background({
  backgroundType = BACKGROUND_TYPE.MAP,
  showClouds = true,
  showLogos = true,
}) {

  const backgroundImage = useMemo(() => {
    switch (backgroundType) {
      case BACKGROUND_TYPE.MAP:
        return defaultBackgroundImage;
      case BACKGROUND_TYPE.BLURED_MAP:
        return bluredBackgroundImage;
      case BACKGROUND_TYPE.PARCHMENT:
        return parchmentBackground;
    }
  }, [backgroundType]);

  return (
    <div className="background-content">
      <AbsoluteImage src={backgroundImage} className="background-image" width={1920} height={1080} />
      {showClouds ? (
        <>
          <AbsoluteImage src={cloudImage1} className="cloud" top={0} left={0} />
          <AbsoluteImage src={cloudImage2} className="cloud" top={0} right={0} />
          <AbsoluteImage src={cloudImage3} className="cloud" bottom={0} left={0} />
          <AbsoluteImage src={cloudImage4} className="cloud" bottom={0} right={0} />
        </>
      ) : null}


      {showLogos ? <div className="background-logos" aria-hidden="true">
        {logos.map((logoSrc) => (
          <img
            key={logoSrc}
            src={logoSrc}
            alt="logo"
            className="main-logo-image"
          />
        ))}
      </div> : null}
    </div>
  );
}

export default Background;
