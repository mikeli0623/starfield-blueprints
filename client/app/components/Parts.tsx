"use client";
import React, { useEffect, useRef, useState } from "react";
import PartsTable from "./PartsTable";
import { chunkSize, json } from "../util/constants";
import Fuse from "fuse.js";
import PinnedPartsTable from "./PinnedPartsTable";
import { Part } from "../util/types";
import InfiniteScroll from "react-infinite-scroll-component";

const fuseOptions = {
  minMatchCharLength: 2,
  ignoreLocation: true,
  threshold: 0.4,
  keys: ["partName"],
};
const fuse = new Fuse(json.getAllParts(), fuseOptions);

interface Props {
  addedParts: { part: Part; amount: number }[];
  setAddedParts: React.Dispatch<
    React.SetStateAction<{ part: Part; amount: number }[]>
  >;
}

const Parts = ({ addedParts, setAddedParts }: Props) => {
  const [moduleType, setModuleType] = useState("all");
  const [classType, setClassType] = useState("all");
  const [parts, setParts] = useState(json.getParts(moduleType, classType, 0));
  const [search, setSearch] = useState<string>("");
  const lockoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lockoutRef.current) {
      clearInterval(lockoutRef.current);
    }
    lockoutRef.current = setTimeout(() => {
      scrollRef.current?.scroll({ top: 0, behavior: "auto" });
      setSearch(e.target.value);
    }, 400);
  };

  const [currentChunkSize, setCurrentChunkSize] = useState<number>(
    json.getChunkSize()
  );
  const [hasMore, setHasMore] = useState(
    currentChunkSize < json.getMaxChunkSize()
  );

  useEffect(() => {
    let searchParts;

    if (search.length > 0) {
      const fused = fuse.search(search).map((res) => res.item);
      searchParts = fused.slice(0, currentChunkSize);
      setHasMore(currentChunkSize < fused.length);
    } else {
      searchParts = json.getParts(moduleType, classType, currentChunkSize);
    }

    if (moduleType !== "all") {
      searchParts = searchParts.filter(
        (part: any) =>
          part.moduleType.toLowerCase() === moduleType.toLowerCase()
      );
    }

    if (classType !== "all") {
      searchParts = searchParts.filter(
        (part: any) =>
          part.class && part.class.toLowerCase() === classType.toLowerCase()
      );
    }

    setParts(searchParts);
  }, [search, moduleType, classType, currentChunkSize]);

  const handleNext = () => {
    console.log("here");
    setCurrentChunkSize((prev) => prev + chunkSize);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="w-full">
        <PinnedPartsTable parts={addedParts} setParts={setAddedParts} />
      </div>
      <div className="join my-2">
        <div>
          <input
            className="input input-bordered join-item"
            placeholder="Search"
            onChange={handleSearchChange}
          />
        </div>
        <select
          defaultValue="all"
          className="select select-bordered join-item"
          onChange={(e) => setModuleType(e.target.value)}
        >
          <option value="all">All</option>
          <option value="weapons">Weapons</option>
          <option value="cockpits">Cockpits</option>
          <option value="engines">Engines</option>
          <option value="shields">Shields</option>
          <option value="fuel tanks">Fuel Tanks</option>
          <option value="grav drives">Grav Drives</option>
          <option value="bays">Bays</option>
          <option value="dockers">Dockers</option>
          <option value="gear">Gear</option>
          <option value="cargo">Cargo</option>
          <option value="reactors">Reactors</option>
          <option value="habs">Habs</option>
          <option value="structural">Structural</option>
          <option value="equipment">Equipment</option>
        </select>
        <select
          defaultValue="all"
          className="select select-bordered join-item"
          onChange={(e) => setClassType(e.target.value)}
        >
          <option value="all">All</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      <div
        className="max-h-[50vh] overflow-auto"
        id="scrollableDiv"
        ref={scrollRef}
      >
        <InfiniteScroll
          dataLength={currentChunkSize}
          hasMore={hasMore}
          loader={<></>}
          next={handleNext}
          scrollableTarget="scrollableDiv"
        >
          <PartsTable parts={parts} setAddedParts={setAddedParts} />
        </InfiniteScroll>
      </div>
    </>
  );
};

export default Parts;
