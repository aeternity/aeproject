import fs from "fs/promises";
import prompts from "prompts";

async function prompt(action, target) {
  const response = await prompts({
    type: "text",
    name: "value",
    message: `Do you want to ${action} '${target}'? (y/N):`,
  });

  const input = response.value.trim();
  return input === "YES" || input === "yes" || input === "Y" || input === "y";
}

async function getStatOrNullIfMissed(path) {
  try {
    return await fs.stat(path);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export async function copyFolderRecursive(srcDir, dstDir, y = false) {
  return fs.cp(srcDir, dstDir, {
    recursive: true,
    async filter(_src, dest) {
      if (y) return true;
      const stat = await getStatOrNullIfMissed(dest);
      if (stat == null) return true;
      if (stat.isDirectory()) return true;
      return await prompt("overwrite", dest);
    },
  });
}

export async function deleteWithPrompt(target, y = false) {
  if ((await getStatOrNullIfMissed(target)) == null) return;
  if (y || (await prompt("delete", target))) {
    await fs.rm(target, { recursive: true });
  }
}
