import { SQL, and, eq, asc, desc } from "drizzle-orm/sql";
import {
  SQLiteSelectQueryBuilder,
  SQLiteSelectDynamic,
} from "drizzle-orm/sqlite-core";

/**
 * A common sorting type that tells you which column to sort
 * and in which order.
 */
export interface SortingState {
  id: string;
  desc?: boolean;
}

/**
 * Options for pagination, sorting, and filtering. In addition
 * to page, pageSize, and sorting, you may pass extra filter values.
 */
export interface PaginationSortFilterOptions {
  page?: number;
  pageSize?: number;
  sorting?: SortingState[];
  // any extra properties (like brandId, categoryId, or others)
  // can be added here and will be used via the filterMapping.
  [key: string]: any;
}

/**
 * A generic helper that enhances any dynamic SQLite query builder
 * with filtering, sorting, and pagination. You may pass in a
 * filtering mapping and a sorting mapping to customize which table
 * columns are used.
 *
 * @param qb             A query builder (static) that we'll convert to dynamic.
 * @param options        Pagination, sorting, and filtering options.
 * @param filterMapping  An optional record mapping filter option keys to table columns.
 * @param sortingMapping An optional record mapping sort ids to table columns.
 *
 * @returns A dynamic query builder with the modifications applied.
 */
export function withPaginationSortFilter<
  T extends SQLiteSelectQueryBuilder,
  FilterMapping extends Record<string, any> = {},
  SortingMapping extends Record<string, any> = {},
>(
  qb: T,
  options: PaginationSortFilterOptions,
  filterMapping?: FilterMapping,
  sortingMapping?: SortingMapping,
): SQLiteSelectDynamic<T> {
  const { page = 1, pageSize = 10, sorting = [] } = options;

  // Convert to dynamic mode.
  let query = qb.$dynamic() as SQLiteSelectDynamic<T>;

  // Filtering: iterate over the keys from filterMapping.
  if (filterMapping) {
    const conditions: SQL<unknown>[] = [];
    for (const key in filterMapping) {
      const value = options[key];
      if (value !== undefined && value !== 0) {
        conditions.push(eq(filterMapping[key], value));
      }
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as SQLiteSelectDynamic<T>;
    }
  }

  // Sorting: build order conditions if a sorting mapping is provided.
  if (sortingMapping && sorting.length) {
    const orderByConditions: SQL<unknown>[] = sorting
      .map((sort) => {
        const column = sortingMapping[sort.id];
        if (column) {
          return sort.desc ? desc(column) : asc(column);
        }
        return null;
      })
      .filter((cond): cond is SQL<unknown> => cond !== null);
    if (orderByConditions.length > 0) {
      query = query.orderBy(...orderByConditions) as SQLiteSelectDynamic<T>;
    }
  }

  // Pagination: set LIMIT and OFFSET.
query = (query.limit(pageSize) as any).offset((page - 1) * pageSize);

  return query;
}
