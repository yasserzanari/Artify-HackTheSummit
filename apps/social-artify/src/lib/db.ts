import fs from "fs";
import path from "path";
import type { User, Artwork } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

type StoredUser = User & { password: string };

function read<T>(file: string): T[] {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function write<T>(file: string, data: T[]): void {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

export const db = {
  users: {
    getAll: () => read<StoredUser>("users.json"),
    save: (users: StoredUser[]) => write("users.json", users),
  },
  artworks: {
    getAll: () => read<Artwork>("artworks.json"),
    save: (artworks: Artwork[]) => write("artworks.json", artworks),
  },
};
