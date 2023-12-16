import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
  DataSet,
  // @ts-ignore
} from "obscenity";

import parseJSON from "./parseJSON";
export const json = new parseJSON();

const myDataset = new DataSet<{ originalWord: string }>()
  // addAll() adds all the data from the dataset passed.
  .addAll(englishDataset)
  // removePhrasesIf() removes phrases from the current dataset if the function provided
  // returns true.
  // cockpit
  .removePhrasesIf((phrase: any) => phrase.metadata.originalWord === "cock");

export const matcher = new RegExpMatcher({
  ...myDataset.build(),
  ...englishRecommendedTransformers,
});

export const API_URL = "http://localhost:8080/api";
export const IMG_URL = "https://starfield-blueprints.s3.amazonaws.com/";

export const DELAYED_LOADING = 200;

export const validImageTypes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
];
export const MAX_DESCRIPTION_LENGTH = 10000;
export const MAX_TITLE_LENGTH = 50;
export const MAX_ABOUT_LENGTH = 200;
export const MAX_IMAGES = 5;
