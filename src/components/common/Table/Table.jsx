import React, { useState, useMemo, useEffect } from "react";
import { Filter, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import Pagination from "../Pagination/Pagination";
import styles from "./Table.module.css";

export default function Table({
  columns,
  data,
  emptyMessage = "No records found.",
  loading = false,
  getRowStyle,
  minWidth,
  searchQuery = "",
  selectable = false,
  selectedRowIds = [],
  onSelectChange,
  pagination = false,
  itemsPerPage = 10,
}) {
  const [sortConfig, setSortConfig] = useState(null);
  const [filters, setFilters] = useState({});
  const [openFilter, setOpenFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when data or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [data, searchQuery, filters, sortConfig, itemsPerPage]);

  useEffect(() => {
    if (!openFilter) return;
    const handleDocClick = () => setOpenFilter(null);
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, [openFilter]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredData = useMemo(() => {
    if (!data) return [];

    let result = data;

    if (Object.keys(filters).length > 0) {
      result = result.filter((row) => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          const colDef = columns.find((c) => c.key === key);
          if (colDef && colDef.filterMatch) {
            return colDef.filterMatch(row, value);
          }
          const rowVal = row[key];
          if (rowVal === null || rowVal === undefined) return false;
          return String(rowVal) === String(value);
        });
      });
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((row) => {
        return columns.some((col) => {
          if (!col.key) return false;
          const val = row[col.key];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(lowerQuery);
        });
      });
    }

    return result;
  }, [data, searchQuery, columns, filters]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (valA === null || valA === undefined) valA = "";
      if (valB === null || valB === undefined) valB = "";

      if (typeof valA === "string" && typeof valB === "string") {
        return sortConfig.direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (valA < valB) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, pagination, currentPage, itemsPerPage]);

  const totalPages = pagination ? Math.ceil(sortedData.length / itemsPerPage) : 1;

  const requestSort = (key) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    } else if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "desc"
    ) {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return <p className={styles.empty}>Loading...</p>;
  }

  if (!data || data.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  const isAllPageSelected = paginatedData.length > 0 && paginatedData.every(r => selectedRowIds.includes(r.id));
  const isSomePageSelected = paginatedData.length > 0 && paginatedData.some(r => selectedRowIds.includes(r.id)) && !isAllPageSelected;

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.scrollContainer}>
        <table
          className={styles.table}
          style={minWidth ? { minWidth } : undefined}
        >
          <thead>
            <tr>
              {selectable && (
                <th className={styles.fixedHeader} style={{ width: '40px', minWidth: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    style={{ cursor: 'pointer' }}
                    checked={isAllPageSelected}
                    ref={input => {
                      if (input) {
                        input.indeterminate = isSomePageSelected;
                      }
                    }}
                    onChange={(e) => {
                      if (!onSelectChange) return;
                      if (e.target.checked) {
                        const newIds = new Set(selectedRowIds);
                        paginatedData.forEach(r => newIds.add(r.id));
                        onSelectChange(Array.from(newIds));
                      } else {
                        const pageIds = new Set(paginatedData.map(r => r.id));
                        onSelectChange(selectedRowIds.filter(id => !pageIds.has(id)));
                      }
                    }}
                    aria-label="Select all rows on this page"
                  />
                </th>
              )}
              {columns.map((col, i) => (
                <th
                  key={col.key || i}
                  className={styles.fixedHeader}
                  style={{
                    zIndex: openFilter === col.key ? 100 : undefined,
                    ...(col.width
                      ? { width: col.width, minWidth: col.width }
                      : {}),
                    ...(col.sortable
                      ? { cursor: "pointer", userSelect: "none" }
                      : {}),
                  }}
                  onClick={
                    col.sortable ? () => requestSort(col.key) : undefined
                  }
                  onKeyDown={
                    col.sortable ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        requestSort(col.key);
                      }
                    } : undefined
                  }
                  title={col.sortable ? "Click to sort" : undefined}
                  tabIndex={col.sortable ? 0 : undefined}
                  role="columnheader"
                  aria-sort={sortConfig?.key === col.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ flex: 1 }}>{col.label}</span>
                    {col.sortable && (
                      <span
                        style={{
                          display: "flex",
                          opacity: sortConfig?.key === col.key ? 1 : 0.4,
                        }}
                      >
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )
                        ) : (
                          <ChevronsUpDown size={14} />
                        )}
                      </span>
                    )}
                    {col.filterOptions && (
                      <>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenFilter((prev) =>
                              prev === col.key ? null : col.key,
                            );
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenFilter((prev) =>
                                prev === col.key ? null : col.key,
                              );
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Filter ${col.label}`}
                          aria-haspopup="listbox"
                          aria-expanded={openFilter === col.key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            background:
                              filters[col.key] || openFilter === col.key
                                ? "var(--surface-color-alt, #f1f5f9)"
                                : "transparent",
                            padding: "4px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          <Filter
                            size={14}
                            style={{
                              opacity:
                                filters[col.key] || openFilter === col.key
                                  ? 1
                                  : 0.4,
                              flexShrink: 0,
                            }}
                          />
                        </div>

                        {openFilter === col.key && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            role="listbox"
                            aria-label={`Filter options for ${col.label}`}
                            style={{
                              position: "absolute",
                              top: "100%",
                              right: "-49px",
                              marginTop: "-10px",
                              background: "var(--surface-color, #ffffff)",
                              border: "1px solid var(--border-color, #e2e8f0)",
                              borderRadius: "6px",
                              boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                              zIndex: 2,
                              minWidth: "140px",
                              display: "flex",
                              flexDirection: "column",
                              padding: "4px",
                              color: "var(--text-color, #1e293b)",
                              textAlign: "left",
                            }}
                          >
                            <div
                              role="option"
                              aria-selected={!filters[col.key]}
                              tabIndex={0}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                borderRadius: "4px",
                                fontSize: "13px",
                                background: !filters[col.key]
                                  ? "var(--surface-color-alt, #f1f5f9)"
                                  : "transparent",
                                fontWeight: !filters[col.key] ? 600 : 400,
                              }}
                              onClick={() => {
                                handleFilterChange(col.key, "");
                                setOpenFilter(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleFilterChange(col.key, "");
                                  setOpenFilter(null);
                                } else if (e.key === 'Escape') {
                                  setOpenFilter(null);
                                }
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "var(--surface-color-alt, #f1f5f9)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = !filters[
                                  col.key
                                ]
                                  ? "var(--surface-color-alt, #f1f5f9)"
                                  : "transparent")
                              }
                            >
                              All
                            </div>
                            {col.filterOptions.map((opt) => {
                              const isObj = typeof opt === "object";
                              const val = isObj ? opt.value : opt;
                              const label = isObj ? opt.label : opt;
                              const isSelected =
                                filters[col.key] === String(val);
                              return (
                                <div
                                  key={val}
                                  role="option"
                                  aria-selected={isSelected}
                                  tabIndex={0}
                                  style={{
                                    padding: "8px 12px",
                                    cursor: "pointer",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                    background: isSelected
                                      ? "var(--surface-color-alt, #f1f5f9)"
                                      : "transparent",
                                    fontWeight: isSelected ? 600 : 400,
                                  }}
                                  onClick={() => {
                                    handleFilterChange(col.key, val);
                                    setOpenFilter(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleFilterChange(col.key, val);
                                      setOpenFilter(null);
                                    } else if (e.key === 'Escape') {
                                      setOpenFilter(null);
                                    }
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      "var(--surface-color-alt, #f1f5f9)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      isSelected
                                        ? "var(--surface-color-alt, #f1f5f9)"
                                        : "transparent")
                                  }
                                >
                                  {label}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: 0 }}>
                  <div className={styles.noDataContent}>
                    No matching records found.
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  style={getRowStyle ? getRowStyle(row) : undefined}
                >
                  {selectable && (
                    <td style={{ width: '40px', minWidth: '40px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        style={{ cursor: 'pointer' }}
                        checked={selectedRowIds.includes(row.id)}
                        onChange={(e) => {
                          if (!onSelectChange) return;
                          if (e.target.checked) {
                            onSelectChange([...selectedRowIds, row.id]);
                          } else {
                            onSelectChange(selectedRowIds.filter(id => id !== row.id));
                          }
                        }}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col, colIndex) => (
                    <td key={col.key || colIndex}>
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && sortedData.length > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
