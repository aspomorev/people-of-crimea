import { useState } from 'react'
import PanelScroll from '../components/PanelScroll'
import PageTextTitle from "../components/PageTextTitle";
import DivImage from "../components/DivImage";
import parchmentBackground from "../assets/Фон пергамент.png";

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
    <section className="timeline-page">
      <div className="panels-wrap">
        <PageTextTitle>Современная этника</PageTextTitle>
        <div className="panels-row">
          <DivImage
            src={parchmentBackground}
            className="panel panel--left"
            unsetSize
            style={{ backgroundSize: "100% 100%" }}
          >
            <p>Выберите народ</p>
            <div className="panel-list">
              {ethnicityImages.map((image) => (
                <div
                  key={image.src}
                  className={`panel-item${activeEthnicityImage === image.src ? " panel-item--active" : ""}`}
                >
                  <img
                    src={image.src}
                    alt={image.name}
                    className={`panel-item-image${activeEthnicityImage === image.src ? " panel-item-image--active" : ""}`}
                    onClick={() => setActiveEthnicityImage(image.src)}
                  />
                </div>
              ))}
            </div>
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
