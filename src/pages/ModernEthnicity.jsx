import { useState } from "react";
import PanelScroll from "../components/PanelScroll";
import PageTextTitle from "../components/PageTextTitle";
import DivImage from "../components/DivImage";
import parchmentBackground from "../assets/Фон пергамент.png";
import ethnicityIcon from "../assets/7-modern ethnicity/этнокультурный код.png";
import titleScrollImage from "../assets/7-modern ethnicity/Современная  этника  свиток.png";
import listArrowDownImage from "../assets/7-modern ethnicity/стрелка вниз.png";
import AbsoluteImage from "../components/AbsoluteImage";
import PagedList from "../components/PagedList";
import "./ModernEthnicity.css";

const ethnicityImageModules = import.meta.glob(
  "../assets/7-modern ethnicity/data/*.{png,jpg,jpeg,webp,svg,gif}",
  {
    eager: true,
    import: "default",
  },
);

const ethnicityHtmlModules = import.meta.glob(
  "../assets/7-modern ethnicity/data/*.html",
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
);

const ethnicityImages = Object.entries(ethnicityImageModules)
  .sort(([pathA], [pathB]) =>
    pathA.localeCompare(pathB, undefined, { numeric: true }),
  )
  .map(([path, src]) => ({
    src,
    name:
      path
        .split("/")
        .pop()
        ?.replace(/\.[^/.]+$/, "") ?? "ethnicity",
  }));

const ethnicityHtmlByNumber = Object.entries(ethnicityHtmlModules).reduce(
  (acc, [path, html]) => {
    const fileName = path.split("/").pop() ?? "";
    const number = fileName.match(/^(\d+)/)?.[1];
    if (number) {
      acc[number] = html;
    }
    return acc;
  },
  {},
);

function ModernEthnicity() {
  const [activeEthnicityImage, setActiveEthnicityImage] = useState(
    ethnicityImages[0]?.src ?? null,
  );
  const activeEthnicity = ethnicityImages.find(
    (image) => image.src === activeEthnicityImage,
  );
  const activeEthnicityNumber = activeEthnicity?.name.match(/^(\d+)/)?.[1];
  const activeEthnicityHtml = activeEthnicityNumber
    ? ethnicityHtmlByNumber[activeEthnicityNumber]
    : "";

  return (
    <section className="modern-ethnicity-page">
      <div className="panels-wrap" style= {{width: '100%'}}>
        <AbsoluteImage src={ethnicityIcon} left={'50%'} fromCenterX />
        <AbsoluteImage src={titleScrollImage} top={80} left={'50%'} fromCenterX />
        <div className="panels-row">
          <DivImage
            src={parchmentBackground}
            className="panel panel--left"
            unsetSize
            style={{ backgroundSize: "100% 100%" }}
          >
            <p>Выберите народ</p>
            <PagedList
              nextSrc={listArrowDownImage}
              itemsSrc={ethnicityImages}
              prevAriaLabel="Показать предыдущие народы"
              nextAriaLabel="Показать следующие народы"
              className="modern-ethnicity-panel-list"
              child={(image) => (
                <div
                  key={image.src}
                  className={`panel-item modern-ethnicity-panel-item${activeEthnicityImage === image.src ? " panel-item--active" : ""}`}
                >
                  <img
                    src={image.src}
                    alt={image.name}
                    className={`panel-item-image${activeEthnicityImage === image.src ? " panel-item-image--active" : ""}`}
                    onClick={() => setActiveEthnicityImage(image.src)}
                  />
                </div>
              )}
            />
          </DivImage>
          <DivImage
            src={parchmentBackground}
            className="panel panel--right"
            unsetSize
            style={{ backgroundSize: "100% 100%" }}
          >
            <PanelScroll key={activeEthnicityNumber}>
              {activeEthnicityHtml ? (
                <div
                  className="panel-content"
                  dangerouslySetInnerHTML={{ __html: activeEthnicityHtml }}
                />
              ) : (
                <div className="panel-content">
                  Контент для выбранного народа не найден.
                </div>
              )}
            </PanelScroll>
          </DivImage>
        </div>
      </div>
    </section>
  );
}

export default ModernEthnicity;
