import { useMemo } from "react";
import { useParams } from "react-router-dom";
import Absolute from "../components/Absolute";
import DivImage from "../components/DivImage";
import ScrollTitle from "../components/ScrollTitle";
import PanelScroll from "../components/PanelScroll";
import peopleNamePlateImage from "../assets/4-concrete-route-map/people-name-plate.png";
import "./Landmark.css";

const peopleSettingsModules = import.meta.glob(
  "../assets/5-concrete-route-city/data/*/settings.json",
  {
    eager: true,
    import: "default",
  },
);

const citySettingsModules = import.meta.glob(
  "../assets/5-concrete-route-city/data/*/*/settings.json",
  {
    eager: true,
    import: "default",
  },
);

const landmarkContentModules = import.meta.glob(
  "../assets/5-concrete-route-city/data/*/*/*/content.html",
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
);

const landmarkImageModules = import.meta.glob(
  "../assets/5-concrete-route-city/data/*/*/*/image.png",
  {
    eager: true,
    import: "default",
  },
);

const landmarkSettingsModules = import.meta.glob(
  "../assets/5-concrete-route-city/data/*/*/*/settings.json",
  {
    eager: true,
    import: "default",
  },
);

const landmarkTypeIconModules = import.meta.glob(
  "../assets/5-concrete-route-city/*-icon.png",
  {
    eager: true,
    import: "default",
  },
);

function getPeopleSettings(peopleName) {
  const modulePath = Object.keys(peopleSettingsModules).find((path) => {
    const match = path.match(
      /\/5-concrete-route-city\/data\/([^/]+)\/settings\.json$/,
    );
    return match?.[1] === peopleName;
  });

  return modulePath ? peopleSettingsModules[modulePath] : null;
}

function getCitySettings(peopleName, cityName) {
  const modulePath = Object.keys(citySettingsModules).find((path) => {
    const match = path.match(
      /\/5-concrete-route-city\/data\/([^/]+)\/([^/]+)\/settings\.json$/,
    );
    return match?.[1] === peopleName && match?.[2] === cityName;
  });

  return modulePath ? citySettingsModules[modulePath] : null;
}

function getRouteCitySettings(peopleName, cityName) {
  return getCitySettings(peopleName, cityName) ?? getPeopleSettings(peopleName);
}

function getLandmarkContent(peopleName, cityName, folderName) {
  const modulePath = Object.keys(landmarkContentModules).find((path) => {
    const match = path.match(
      /\/5-concrete-route-city\/data\/([^/]+)\/([^/]+)\/([^/]+)\/content\.html$/,
    );
    return (
      match?.[1] === peopleName &&
      match?.[2] === cityName &&
      match?.[3] === folderName
    );
  });

  return modulePath ? landmarkContentModules[modulePath] : "";
}

function getLandmarkImage(peopleName, cityName, folderName) {
  const modulePath = Object.keys(landmarkImageModules).find((path) => {
    const match = path.match(
      /\/5-concrete-route-city\/data\/([^/]+)\/([^/]+)\/([^/]+)\/image\.png$/,
    );
    return (
      match?.[1] === peopleName &&
      match?.[2] === cityName &&
      match?.[3] === folderName
    );
  });

  return modulePath ? landmarkImageModules[modulePath] : null;
}

function getLandmarkSettings(peopleName, cityName, folderName) {
  const modulePath = Object.keys(landmarkSettingsModules).find((path) => {
    const match = path.match(
      /\/5-concrete-route-city\/data\/([^/]+)\/([^/]+)\/([^/]+)\/settings\.json$/,
    );
    return (
      match?.[1] === peopleName &&
      match?.[2] === cityName &&
      match?.[3] === folderName
    );
  });

  return modulePath ? landmarkSettingsModules[modulePath] : null;
}

function getLandmarkTypeIcon(iconType) {
  if (!iconType) {
    return null;
  }

  const modulePath = Object.keys(landmarkTypeIconModules).find((path) => {
    const match = path.match(/\/5-concrete-route-city\/([^/]+)-icon\.png$/);
    return match?.[1] === iconType;
  });

  return modulePath ? landmarkTypeIconModules[modulePath] : null;
}

function getLandmarkSmallIcon(peopleName, cityName, folderName) {
  const landmarkSettings = getLandmarkSettings(peopleName, cityName, folderName);
  return getLandmarkTypeIcon(landmarkSettings?.["icon-type"]);
}

function getLandmarkTitle(folderName) {
  const match = folderName.match(/^\d+\.\s+(.+)$/);
  return (match?.[1] ?? folderName).trim();
}

function Landmark() {
  const { people, city, landmark } = useParams();
  const peopleName = decodeURIComponent(people ?? "");
  const cityName = decodeURIComponent(city ?? "");
  const folderName = decodeURIComponent(landmark ?? "");

  const pageData = useMemo(() => {
    const citySettings = getRouteCitySettings(peopleName, cityName);
    return {
      titleText: citySettings?.titleText ?? cityName.toUpperCase(),
      contentHtml: getLandmarkContent(peopleName, cityName, folderName),
      landmarkImage: getLandmarkImage(peopleName, cityName, folderName),
      landmarkSmallIcon: getLandmarkSmallIcon(peopleName, cityName, folderName),
      landmarkTitle: getLandmarkTitle(folderName),
    };
  }, [peopleName, cityName, folderName]);

  return (
    <section className="landmark-page">
      <Absolute fromCenter top={156} left={1550}>
        <ScrollTitle>{peopleName}</ScrollTitle>
      </Absolute>
      <DivImage
        src={peopleNamePlateImage}
        fromCenter
        top={290}
        left={1550}
        className="people-name-plate"
      >
        {pageData.titleText.toUpperCase()}
      </DivImage>

      <div className="landmark-layout">
        <div className="landmark-layout-column landmark-layout-column--left">
          <PanelScroll>
            {pageData.contentHtml ? (
              <div
                className="landmark-content"
                dangerouslySetInnerHTML={{ __html: pageData.contentHtml }}
              />
            ) : (
              <div className="landmark-content">
                Контент для выбранной достопримечательности не найден.
              </div>
            )}
          </PanelScroll>
        </div>
        <div className="landmark-layout-column landmark-layout-column--right">
          <div className="landmark-visual-block">
            {pageData.landmarkImage ? (
              <img
                src={pageData.landmarkImage}
                alt={folderName}
                className="landmark-image"
              />
            ) : (
              <div className="landmark-image-placeholder">
                Изображение не найдено.
              </div>
            )}
            <div className="landmark-divider" />
            <div className="landmark-meta">
              {pageData.landmarkSmallIcon ? (
                <img
                  src={pageData.landmarkSmallIcon}
                  alt=""
                  className="landmark-meta-icon"
                />
              ) : null}
              <span className="landmark-meta-title">
                {pageData.landmarkTitle}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Landmark;
