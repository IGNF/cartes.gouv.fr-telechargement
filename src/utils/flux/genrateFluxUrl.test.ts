// src/utils/flux/generateFluxUrl.test.ts
import { generateFluxUrl } from "./generateFluxUrl";

describe("generateFluxUrl", () => {
  it("génère une URL valide avec les paramètres par défaut", () => {
    const url = generateFluxUrl("IGNF_LIDAR-HD_TA:mns-bloc");
    expect(url).toContain("typeNames=IGNF_LIDAR-HD_TA:mns-bloc");
    expect(url).toContain("service=WFS");
  });

  it("surcharge les paramètres par défaut", () => {
    const url = generateFluxUrl("IGNF_LIDAR-HD_TA:mns-bloc", { version: "1.1.0" });
    expect(url).toContain("version=1.1.0");
  });

  it("lève une erreur si typeNames est absent", () => {
    expect(() => generateFluxUrl("")).toThrow("typeNames est requis");
  });
});
