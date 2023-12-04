import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
  DataSet,
  // @ts-ignore
} from "obscenity";

import parseJSON from "./parseJSON";
export const json = new parseJSON();
export const chunkSize = json.getChunkSize();

const myDataset = new DataSet<{ originalWord: string }>()
  // addAll() adds all the data from the dataset passed.
  .addAll(englishDataset)
  // removePhrasesIf() removes phrases from the current dataset if the function provided
  // returns true.
  .removePhrasesIf((phrase: any) => phrase.metadata.originalWord === "cock");

export const matcher = new RegExpMatcher({
  ...myDataset.build(),
  ...englishRecommendedTransformers,
});

export const API_URL = "http://localhost:8080/api";
export const IMG_URL = "https://starfield-blueprints.s3.amazonaws.com/";
