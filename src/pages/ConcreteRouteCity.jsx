import { useMemo } from "react";
import { useParams } from "react-router-dom";
import Absolute from "../components/Absolute";
import AbsoluteImage from "../components/AbsoluteImage";
import DivImage from "../components/DivImage";
import LandmarkPlate from "../components/LandmarkPlate";
import ScrollTitle from "../components/ScrollTitle";
import peopleNamePlateImage from "../assets/4-concrete-route-map/people-name-plate.png";
import "./ConcreteRouteCity.css";
import studentImage from "../assets/girl.png";
import scrollImage from "../assets/5-concrete-route-city/scroll.png";
import textPlateImage from '../assets/5-concrete-route-city/dialog-bg.png'

const legacyCityHtmlModules = import.meta.glob(
  "../assets/5-concrete-route-city/data/*/*.html",
  {
    eager: true,
    query: "?raw",
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

const landmarkIconModules = import.meta.glob(
  "../assets/5-concrete-route-city/data/*/*/*/icon.png",
  {
    eager: true,
    import: "default",
  },
);

const peopleSettingsModules = import.meta.glob(
  "../assets/5-concrete-route-city/data/*/settings.json",
  {
    eager: true,
    import: "default",
  },
);

const peopleGirlModules = import.meta.glob(
  "../assets/5-concrete-route-city/data/*/girl.png",
  {
    eager: true,
    import: "default",
  },
);

const cityAssetModules = import.meta.glob(
  "../assets/5-concrete-route-city/data/*/img/*.{png,jpg,jpeg,webp,gif,svg}",
  {
    eager: true,
    import: "default",
  },
);

const cityAssetUrlsByKey = Object.fromEntries(
  Object.entries(cityAssetModules).map(([path, url]) => {
    const key = path.match(/\/5-concrete-route-city\/data\/(.+)$/)?.[1] ?? "";
    return [key, url];
  }),
);

function parseLandmarkFolderName(folderName) {
  if (/копия/i.test(folderName)) {
    return null;
  }

  const match = folderName.match(/^(\d+)\.\s+(.+)$/);
  if (!match) {
    return null;
  }

  return {
    order: Number(match[1]),
    title: match[2].trim(),
    folderName,
  };
}

function getLandmarksForCity(peopleName, cityName) {
  const landmarksByFolder = new Map();

  for (const [path, iconUrl] of Object.entries(landmarkIconModules)) {
    const match = path.match(
      /\/5-concrete-route-city\/data\/([^/]+)\/([^/]+)\/([^/]+)\/icon\.png$/,
    );
    if (!match || match[1] !== peopleName || match[2] !== cityName) {
      continue;
    }

    const parsed = parseLandmarkFolderName(match[3]);
    if (!parsed) {
      continue;
    }

    landmarksByFolder.set(parsed.folderName, {
      ...parsed,
      iconUrl,
    });
  }

  for (const path of Object.keys(landmarkContentModules)) {
    const match = path.match(
      /\/5-concrete-route-city\/data\/([^/]+)\/([^/]+)\/([^/]+)\/content\.html$/,
    );
    if (!match || match[1] !== peopleName || match[2] !== cityName) {
      continue;
    }

    const parsed = parseLandmarkFolderName(match[3]);
    if (!parsed || landmarksByFolder.has(parsed.folderName)) {
      continue;
    }

    landmarksByFolder.set(parsed.folderName, {
      ...parsed,
      iconUrl: null,
    });
  }

  return [...landmarksByFolder.values()].sort((a, b) => a.order - b.order);
}

function getPeopleSettings(peopleName) {
  const modulePath = Object.keys(peopleSettingsModules).find((path) => {
    const match = path.match(
      /\/5-concrete-route-city\/data\/([^/]+)\/settings\.json$/,
    );
    return match?.[1] === peopleName;
  });

  return modulePath ? peopleSettingsModules[modulePath] : null;
}

function getPeopleGirlImage(peopleName) {
  const modulePath = Object.keys(peopleGirlModules).find((path) => {
    const match = path.match(
      /\/5-concrete-route-city\/data\/([^/]+)\/girl\.png$/,
    );
    return match?.[1] === peopleName;
  });

  return modulePath ? peopleGirlModules[modulePath] : studentImage;
}

function getLegacyCityHtmlModulePath(peopleName, cityName) {
  return Object.keys(legacyCityHtmlModules).find((path) => {
    const match = path.match(
      /\/5-concrete-route-city\/data\/([^/]+)\/([^/]+)\.html$/,
    );
    return match?.[1] === peopleName && match?.[2] === cityName;
  });
}

function withResolvedCityAssets(html, peopleName) {
  if (!html || !peopleName) {
    return html;
  }

  return html.replace(
    /(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi,
    (_, prefix, src, suffix) => {
      const relativePath = src.replace(/^\.\//, "");
      const assetKey = `${peopleName}/${relativePath}`;
      const resolvedUrl = cityAssetUrlsByKey[assetKey];

      return resolvedUrl
        ? `${prefix}${resolvedUrl}${suffix}`
        : `${prefix}${src}${suffix}`;
    },
  );
}

function ConcreteRouteCity() {
  const { people, city } = useParams();
  const peopleName = decodeURIComponent(people ?? "");
  const cityName = decodeURIComponent(city ?? "");

  const pageData = useMemo(() => {
    const landmarks = getLandmarksForCity(peopleName, cityName);
    const peopleSettings = getPeopleSettings(peopleName);
    const usesFolderStructure = landmarks.length > 0;

    if (usesFolderStructure) {
      return {
        mode: "landmarks",
        landmarks,
        scrollText: peopleSettings?.scrollText ?? "",
        dialogText: peopleSettings?.dialogText ?? "",
        titleText: peopleSettings?.titleText ?? cityName.toUpperCase(),
        girlImage: getPeopleGirlImage(peopleName),
        cityHtml: "",
      };
    }

    const modulePath = getLegacyCityHtmlModulePath(peopleName, cityName);
    const rawHtml = modulePath ? legacyCityHtmlModules[modulePath] : "";
    const resolvedHtml = withResolvedCityAssets(rawHtml, peopleName);

    return {
      mode: "legacy",
      landmarks: [],
      scrollText: peopleSettings?.scrollText ?? "",
      dialogText: peopleSettings?.dialogText ?? "",
      titleText: peopleSettings?.titleText ?? cityName.toUpperCase(),
      girlImage: getPeopleGirlImage(peopleName),
      cityHtml: resolvedHtml,
    };
  }, [peopleName, cityName]);

  return (
    <section className="concrete-route-city-page">
      <Absolute fromCenter top={156} left={1610}>
        <ScrollTitle>{peopleName}</ScrollTitle>
      </Absolute>
      <DivImage
        src={peopleNamePlateImage}
        fromCenter
        top={290}
        left={1610}
        className="people-name-plate"
      >
        {pageData.titleText.toUpperCase()}
      </DivImage>
      <AbsoluteImage src={pageData.girlImage} bottom={0} left={1030} />
      <DivImage
        className="scroll-text"
        src={scrollImage}
        fromCenter
        bottom={410}
        left={1610}
      >
        <div dangerouslySetInnerHTML={{ __html: pageData.scrollText }} />
      </DivImage>
      <DivImage src={textPlateImage} bottom={10} left={260} className="dialog-text">
        <div dangerouslySetInnerHTML={{ __html: pageData.dialogText }} />
      </DivImage>
      {pageData.mode === "landmarks" ? (
        <div className="concrete-route-city-landmarks">
          <div className="concrete-route-city-landmarks-grid">
            {pageData.landmarks.map(({ folderName, title, iconUrl }) => (
              <LandmarkPlate key={folderName} name={title} imageSrc={iconUrl} />
            ))}
          </div>
        </div>
      ) : (
        <div
          className="concrete-route-city-content"
          dangerouslySetInnerHTML={{ __html: pageData.cityHtml }}
        />
      )}
    </section>
  );
}

export default ConcreteRouteCity;
