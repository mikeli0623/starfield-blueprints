import { Part } from "./types";

class ParseJSON {
  partsList: Part[];
  constructor() {
    this.partsList = require(`../../public/shipParts.json`);
  }

  getParts() {
    return this.partsList;
  }

  getPartFromIndex(index: number): Part {
    return this.partsList[index];
  }

  getIndexFromPartName(partName: string): number {
    return this.partsList.findIndex((part) => part.partName === partName);
  }

  getPart(partName: string): Part {
    for (const key of this.partsList) if (key.partName === partName) return key;
    throw new Error(`Part with partName '${partName}' not found.`);
  }
}

export default ParseJSON;
