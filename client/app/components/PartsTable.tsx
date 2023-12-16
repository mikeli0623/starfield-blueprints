import React, { useMemo, useRef, useState } from "react";
import { Part } from "../util/types";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
  ColumnDef,
  Row,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { json } from "../util/constants";
import descIcon from "../../public/descending.svg";
import ascIcon from "../../public/ascending.svg";
import Image from "next/image";
import { fuzzyFilter, otherCharSort } from "../util/utils";
import IndeterminateCheckbox from "./IndeterminateCheckbox";
import DebouncedInput from "./DebouncedInput";

interface Props {
  rowSelection: {
    [key: string]: boolean;
  };
  setRowSelection: React.Dispatch<
    React.SetStateAction<{
      [key: string]: boolean;
    }>
  >;
  handleRowSelection: (key: string) => void;
}

const PartsTable = ({
  rowSelection,
  setRowSelection,
  handleRowSelection,
}: Props) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo<ColumnDef<Part, any>[]>(
    () => [
      {
        id: "select",
        cell: ({ row }) => (
          <span className="w-full h-full flex justify-center items-center">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </span>
        ),
      },
      {
        accessorKey: "partName",
        id: "partName",
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Part Name
          </span>
        ),
        cell: (info) => (
          <span className="w-full h-full flex justify-center items-center">
            {info.getValue()}
          </span>
        ),
        filterFn: "fuzzy",
        sortingFn: "alphanumeric",
        sortDescFirst: false,
      },
      {
        accessorKey: "moduleType",
        sortDescFirst: false,
        id: "moduleType",
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Module Type
          </span>
        ),
        cell: (info) => (
          <span className="w-full h-full flex justify-center items-center">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "class",
        id: "class",
        sortDescFirst: false,
        sortingFn: otherCharSort,
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Class
          </span>
        ),
        cell: (info) => (
          <span className="w-full h-full flex justify-center items-center">
            {info.getValue()}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: json.getParts() ?? [],
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      rowSelection,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
  });

  const { rows } = table.getRowModel();

  const tableContainerRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  const handleModuleType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const moduleType = e.target.value;
    if (moduleType === "all") {
      setColumnFilters(
        columnFilters.filter((filter) => filter.id !== "moduleType")
      );
    } else
      setColumnFilters([
        ...columnFilters,
        { id: "moduleType", value: moduleType },
      ]);
  };

  const [search, setSearch] = useState("");

  const handleSearch = (value: string | number) => {
    const partName = String(value);
    setSearch(partName);
    if (partName.length === 0) {
      setColumnFilters(
        columnFilters.filter((filter) => filter.id !== "partName")
      );
    } else
      setColumnFilters([...columnFilters, { id: "partName", value: partName }]);
  };

  const handleClassType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classType = e.target.value;
    if (classType === "all") {
      setColumnFilters(columnFilters.filter((filter) => filter.id !== "class"));
    } else
      setColumnFilters([...columnFilters, { id: "class", value: classType }]);
  };

  return (
    <>
      <div className="join">
        <DebouncedInput
          value={search}
          onChange={handleSearch}
          className="join-item"
          placeholder="Search part name..."
        />
        <select
          defaultValue="all"
          className="select select-bordered join-item shadow"
          onChange={handleModuleType}
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
          className="select select-bordered join-item shadow"
          onChange={handleClassType}
        >
          <option value="all">All</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      <div
        className="h-[500px] w-[700px] overflow-auto"
        ref={tableContainerRef}
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <>
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? "cursor-pointer select-none flex items-center gap-1"
                                  : "",
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: (
                                  <Image
                                    src={descIcon}
                                    width={20}
                                    height={20}
                                    alt="descending"
                                  />
                                ),
                                desc: (
                                  <Image
                                    src={ascIcon}
                                    width={20}
                                    height={20}
                                    alt="ascending"
                                  />
                                ),
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          </>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {virtualizer.getVirtualItems().length === 0 ? (
                <tr>
                  <td className="text-center py-4" colSpan={4}>
                    No parts found.
                  </td>
                </tr>
              ) : (
                virtualizer.getVirtualItems().map((virtualRow, index) => {
                  const row = rows[virtualRow.index] as Row<Part>;
                  return (
                    <tr
                      key={row.id}
                      className={`cursor-pointer hover:bg-gray-500/20 ${
                        row.id in rowSelection ? "active" : ""
                      }`}
                      onClick={() => handleRowSelection(row.id)}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${
                          virtualRow.start - index * virtualRow.size
                        }px)`,
                      }}
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PartsTable;
