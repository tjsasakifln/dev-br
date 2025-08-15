import fs from "fs/promises";
import path from "path";

const templatesDirectory = path.join(process.cwd(), "..", "..", "templates");

/**
 * Loads a project template from the filesystem.
 * @param templateName The name of the template directory (e.g., "react-fastapi").
 * @returns A record mapping file paths to their string content.
 */
export async function loadTemplate(
  templateName: string
): Promise<Record<string, string>> {
  const templatePath = path.join(templatesDirectory, templateName);
  const filesMap: Record<string, string> = {};

  try {
    const files = await fs.readdir(templatePath, { recursive: true });
    for (const file of files) {
      const filePath = path.join(templatePath, file as string);
      const fileStat = await fs.stat(filePath);

      if (fileStat.isFile()) {
        const content = await fs.readFile(filePath, "utf-8");
        filesMap[file as string] = content;
      }
    }
    return filesMap;
  } catch (error) {
    console.error(`Error loading template "${templateName}":`, error);
    throw new Error(`Template "${templateName}" not found or could not be read.`);
  }
}