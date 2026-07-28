import React, { useState, useMemo, useEffect, useRef } from "react";
import { Filter, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import Pagination from "../Pagination/Pagination";
import useFocusTrap from "hooks/useFocusTrap";
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
  tableLabel = "Data table",
}) {
  const [sortConfig, setSortConfig] = useState(null);
  const [filters, setFilters] = useState({});
  const [openFilter, setOpenFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [announcement, setAnnouncement] = useState("");
  const tableRef = useRef(null);
  const activeFilterRef = useRef(null);

  useFocusTrap(activeFilterRef, !!openFilter);

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
    const colName = columns.find(c => c.key === key)?.label || key;
    setAnnouncement(value ? `Filter applied for ${colName}: ${value}` : `Filter removed for ${colName}`);
  };

  const handleFilterKeyDown = (e, colKey, val) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFilterChange(colKey, val);
      setOpenFilter(null);
    } else if (e.key === 'Escape') {
      setOpenFilter(null);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.currentTarget.nextElementSibling?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.currentTarget.previousElementSibling?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      e.currentTarget.parentElement.firstElementChild?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      e.currentTarget.parentElement.lastElementChild?.focus();
    }
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
      setAnnouncement("Sorting removed");
      return;
    }
    setSortConfig({ key, direction });
    const colName = columns.find(c => c.key === key)?.label || key;
    setAnnouncement(`Sorted by ${colName} ${direction === 'asc' ? 'ascending' : 'descending'}`);
  };



  const isAllPageSelected = paginatedData.length > 0 && paginatedData.every(r => selectedRowIds.includes(r.id));
  const isSomePageSelected = paginatedData.length > 0 && paginatedData.some(r => selectedRowIds.includes(r.id)) && !isAllPageSelected;

  return (
    <div className={styles.tableWrapper}>
      <div aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        {announcement}
      </div>
      <div 
        className={styles.scrollContainer} 
        role="region" 
        aria-label={tableLabel} 
        tabIndex="0"
      >
        <table
          ref={tableRef}
          tabIndex={-1}
          className={styles.table}
          style={{ ...(minWidth ? { minWidth } : {}), outline: 'none' }}
        >
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className={styles.fixedHeader} style={{ width: '40px', minWidth: '40px', textAlign: 'center' }} aria-label="Select">
                  <input
                    type="checkbox"
                    style={{ cursor: 'pointer' }}
                    aria-label="Select all rows"
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
                  scope="col"
                  className={styles.fixedHeader}
                  onBlur={(e) => {
                    if (openFilter === col.key && !e.currentTarget.contains(e.relatedTarget)) {
                      setOpenFilter(null);
                    }
                  }}
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
                            <ChevronUp aria-hidden="true" size={14} />
                          ) : (
                            <ChevronDown aria-hidden="true" size={14} />
                          )
                        ) : (
                          <ChevronsUpDown aria-hidden="true" size={14} />
                        )}
                      </span>
                    )}
                    {col.filterOptions && (
                      <>
                        <button
                          type="button"
                          className={styles.filterBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenFilter((prev) =>
                              prev === col.key ? null : col.key,
                            );
                          }}
                          aria-label={`Filter ${col.label}`}
                          aria-haspopup="listbox"
                          aria-expanded={openFilter === col.key}
                          aria-controls={`filter-listbox-${col.key}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            background:
                              filters[col.key] || openFilter === col.key
                                ? "var(--surface-secondary)"
                                : "transparent",
                            padding: "2px 4px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            border: "none",
                          }}
                        >
                          <Filter
                            aria-hidden="true"
                            size={14}
                            style={{
                              opacity:
                                filters[col.key] || openFilter === col.key
                                  ? 1
                                  : 0.4,
                              flexShrink: 0,
                            }}
                          />
                        </button>

                        {openFilter === col.key && (
                          <div
                            id={`filter-listbox-${col.key}`}
                            ref={activeFilterRef}
                            onClick={(e) => e.stopPropagation()}
                            role="listbox"
                            aria-label={`Filter options for ${col.label}`}
                            style={{
                              position: "absolute",
                              top: "100%",
                              right: "-49px",
                              marginTop: "-10px",
                              background: "var(--surface-primary)",
                              border: "1px solid var(--border-primary)",
                              color: "var(--text-primary)",
                              boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                              zIndex: 2,
                              minWidth: "140px",
                              display: "flex",
                              flexDirection: "column",
                              padding: "4px",
                              color: "var(--text-primary)",
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
                                  ? "var(--surface-secondary)"
                                  : "transparent",
                                fontWeight: !filters[col.key] ? 600 : 400,
                              }}
                              onClick={() => {
                                handleFilterChange(col.key, "");
                                setOpenFilter(null);
                              }}
                              onKeyDown={(e) => handleFilterKeyDown(e, col.key, "")}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "var(--surface-secondary)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = !filters[
                                  col.key
                                ]
                                  ? "var(--surface-secondary)"
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
                                      ? "var(--surface-secondary)"
                                      : "transparent",
                                    fontWeight: isSelected ? 600 : 400,
                                  }}
                                  onClick={() => {
                                    handleFilterChange(col.key, val);
                                    setOpenFilter(null);
                                  }}
                                  onKeyDown={(e) => handleFilterKeyDown(e, col.key, val)}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      "var(--surface-secondary)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      isSelected
                                        ? "var(--surface-secondary)"
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
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: 0 }}>
                  <div className={styles.noDataContent} role="status">
                    Loading...
                  </div>
                </td>
              </tr>
            ) : !data || sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: 0 }}>
                  <div className={styles.noDataContent}>
                    {!data || data.length === 0 ? emptyMessage : "No matching records found."}
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
                        aria-label={`Select row`}
                        checked={selectedRowIds.includes(row.id)}
                        onChange={(e) => {
                          if (!onSelectChange) return;
                          if (e.target.checked) {
                            onSelectChange([...selectedRowIds, row.id]);
                          } else {
                            onSelectChange(selectedRowIds.filter(id => id !== row.id));
                          }
                        }}
                        aria-label={`Select ${row[columns[0]?.key] || `row ${rowIndex + 1}`}`}
                      />
                    </td>
                  )}
                  {columns.map((col, colIndex) => {
                    if (colIndex === 0 && !col.render) {
                      return <th key={col.key || colIndex} scope="row" style={{ fontWeight: 'normal', textAlign: 'left' }}>{row[col.key]}</th>;
                    } else if (colIndex === 0 && col.render) {
                      return <th key={col.key || colIndex} scope="row" style={{ fontWeight: 'normal', textAlign: 'left' }}>{col.render(row, rowIndex)}</th>;
                    }
                    return (
                      <td key={col.key || colIndex}>
                        {col.render ? col.render(row, rowIndex) : row[col.key]}
                      </td>
                    );
                  })}
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
          onPageChange={(page) => {
            setCurrentPage(page);
            if (tableRef.current) tableRef.current.focus({ preventScroll: true });
          }}
        />
      )}
    </div>
  );
}
