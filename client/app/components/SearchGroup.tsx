import React from "react";
import { TagOptions } from "../util/types";
import DebouncedInput from "./DebouncedInput";

interface Props {
  searchValue: string;
  handleSearchChange: (value: string | number) => void;
  tagOptions: TagOptions;
  setTagOptions: React.Dispatch<React.SetStateAction<TagOptions>>;
  time: string;
  setTime: React.Dispatch<React.SetStateAction<string>>;
  sort: string;
  setSort: React.Dispatch<React.SetStateAction<string>>;
}

const SearchGroup = ({
  searchValue,
  handleSearchChange,
  time,
  setTime,
  sort,
  setSort,
  tagOptions,
  setTagOptions,
}: Props) => {
  return (
    <div className="join shadow">
      <DebouncedInput
        type="text"
        className="join-item"
        placeholder="Search"
        value={searchValue}
        onChange={handleSearchChange}
      />
      <select
        className="select select-bordered join-item"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      >
        <option value="allTime">All Time</option>
        <option value="pastDay">Past Day</option>
        <option value="pastWeek">Past Week</option>
        <option value="pastMonth">Past Month</option>
        <option value="pastYear">Past Year</option>
      </select>
      <select
        className="select select-bordered join-item"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="likes">Most Likes</option>
        <option value="createdAt">Most Recent</option>
      </select>
      {Object.entries(tagOptions).map((tag) => {
        const tagName = tag[0];
        return (
          <div className="form-control join-item bg-white px-2" key={tagName}>
            <label className="label cursor-pointer h-full w-full gap-2">
              <span className="label-text">
                {tagName.charAt(0).toUpperCase() + tagName.slice(1)}
              </span>
              <input
                type="checkbox"
                checked={tagOptions[tagName as keyof TagOptions]}
                className="checkbox"
                onChange={() => {
                  setTagOptions({
                    ...tagOptions,
                    [tagName]: !tagOptions[tagName as keyof TagOptions],
                  });
                }}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default SearchGroup;
