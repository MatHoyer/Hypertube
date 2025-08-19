import * as fs from "fs";
import { BencodeDecoder } from "./Bencode";

const file = "./downloads/BigBuckBunny_124_archive.torrent";

export const downloadTorrent = async () => {
  const fileContent = fs.readFileSync(file, "utf-8");

  console.log(fileContent.slice(0, 200));

  const decoder = new BencodeDecoder(fileContent);
  const json = decoder.decode();

  console.log(json);
};
