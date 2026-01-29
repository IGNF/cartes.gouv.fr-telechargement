import JSZip from "jszip";
import { saveAs } from "file-saver";
import { File } from "../assets/@types/types";


export async function downloadZip(files: File[]) {
  const zip = new JSZip();

  const tasks = files.map(async (file) => {
    const response = await fetch(file.url);
    const blob = await response.blob();

    zip.file(file.name, blob);
  });

  await Promise.all(tasks);

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, "export.zip");
}
