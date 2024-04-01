import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
  DataSet,
  // @ts-ignore
} from "obscenity";

import parseJSON from "./parseJSON";
import { PostResponse } from "./types";
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

export const API_URL = "http://159.203.58.44/api";
export const IMG_URL = "https://starfield-blueprints.s3.amazonaws.com/";

export const validImageTypes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
];
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_TITLE_LENGTH = 50;
export const MAX_ABOUT_LENGTH = 250;
export const MAX_IMAGES = 5;

export const PAGE_SIZE = 16;

export const SVG_DATA = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "100%",
  height: "100%",
  shapeRendering: "crispEdges",
  preserveAspectRatio: "none",
  viewBox: "0 0 10 6",
  style: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transformOrigin: "top left",
    transform: "translate(-50%, -50%)",
    right: 0,
    bottom: 0,
  },
};
