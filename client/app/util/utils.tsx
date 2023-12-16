import {
  RankingInfo,
  compareItems,
  rankItem,
} from "@tanstack/match-sorter-utils";
import { FilterFn, SortingFn, sortingFns } from "@tanstack/react-table";
import DOMPurify from "dompurify";

export function formatNumberWithCommas(number: number): string {
  return !Number.isNaN(number)
    ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : "0";
}

export function deleteValueFromArray(arr: any[], value: any): any[] {
  const index = arr.indexOf(value);
  if (index > -1) {
    return arr.toSpliced(index, 1);
  }
  return arr;
}

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

export const dumbSort: SortingFn<any> = (rowA, rowB, columnId) => {
  const valA = JSON.stringify(rowA.original.part[columnId as keyof any]).length;
  const valB = JSON.stringify(rowB.original.part[columnId as keyof any]).length;

  return valA - valB;
};

const charVal = {
  C: 1,
  B: 2,
  A: 3,
};
export const charSort: SortingFn<any> = (rowA, rowB, columnId) => {
  const valA = rowA.original.part[columnId as keyof any]
    ? charVal[rowA.original.part[columnId as keyof any] as keyof {}]
    : 4;
  const valB = rowB.original.part[columnId as keyof any]
    ? charVal[rowB.original.part[columnId as keyof any] as keyof {}]
    : 4;

  return valB - valA;
};

export const otherCharSort: SortingFn<any> = (rowA, rowB, columnId) => {
  const valA = rowA.original[columnId as keyof any]
    ? charVal[rowA.original[columnId as keyof any] as keyof {}]
    : 4;
  const valB = rowB.original[columnId as keyof any]
    ? charVal[rowB.original[columnId as keyof any] as keyof {}]
    : 4;

  return valB - valA;
};

export function sanitizeHTML(htmlString: string): string {
  return DOMPurify.sanitize(htmlString);
}
