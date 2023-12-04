import React from "react";
import { TagOptions } from "../util/types";

interface Props {
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tagOptions: TagOptions;
  setTagOptions: React.Dispatch<React.SetStateAction<TagOptions>>;
  setTime: React.Dispatch<React.SetStateAction<string>>;
  setSort: React.Dispatch<React.SetStateAction<string>>;
}

const SearchGroup = ({
  handleSearchChange,
  setTime,
  setSort,
  tagOptions,
  setTagOptions,
}: Props) => {
  return (
    <div className="join">
      <div>
        <input
          className="input input-bordered join-item"
          placeholder="Search"
          onChange={handleSearchChange}
        />
      </div>
      <select
        defaultValue="allTime"
        className="select select-bordered join-item"
        onChange={(e) => setTime(e.target.value)}
      >
        <option value="allTime">All Time</option>
        <option value="pastDay">Past Day</option>
        <option value="pastWeek">Past Week</option>
        <option value="pastMonth">Past Month</option>
        <option value="pastYear">Past Year</option>
      </select>
      <select
        defaultValue="likes"
        className="select select-bordered join-item"
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
