import { resolve } from "path";
import { readdir, stat } from "fs-extra";

export const resolveServerMain = async function ({ serverMain, libDir }) {
  const libFiles = await readdir(libDir);
  const mainFiles = [];
  for (const fileName of libFiles) {
    if (!fileName.startsWith(serverMain)) {
      continue;
    }

    const filePath = resolve(libDir, fileName);
    const file = await stat(filePath);
    if (file.isDirectory()) {
      continue;
    }

    mainFiles.push(filePath);
  }

  return mainFiles.length && mainFiles[0];
};
