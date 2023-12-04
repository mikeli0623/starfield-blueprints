import { Part } from "./types";

class ParseJSON {
  partsList: Part[];
  chunkSize: number;
  maxChunkSize: number;
  constructor(chunkSize: number = 50) {
    this.partsList = require(`../../public/shipParts.json`);
    this.chunkSize = chunkSize;
    this.maxChunkSize = this.partsList.length;
  }

  getAllParts() {
    return this.partsList;
  }

  getParts(
    moduleFilter: string,
    classFilter: string,
    currentChunkSize: number
  ) {
    let filteredList = [...this.partsList];

    if (moduleFilter !== "all") {
      filteredList = filteredList.filter(
        (part: any) =>
          part.moduleType.toLowerCase() === moduleFilter.toLowerCase()
      );
    }

    if (classFilter !== "all") {
      filteredList = filteredList.filter(
        (part: any) =>
          part.class && part.class.toLowerCase() === classFilter.toLowerCase()
      );
    }

    this.maxChunkSize = filteredList.length;

    const nextChunk = filteredList.slice(0, currentChunkSize);
    return nextChunk;
  }

  getChunkSize() {
    return this.chunkSize;
  }

  getMaxChunkSize() {
    return this.maxChunkSize;
  }

  getPart(partName: string): Part {
    for (const key of this.partsList) if (key.partName === partName) return key;
    throw new Error(`Part with partName '${partName}' not found.`);
  }
}

export default ParseJSON;
