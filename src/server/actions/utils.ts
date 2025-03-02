import { db } from "@/server/db";
import { SortingState } from "@tanstack/react-table";
import { SQL, SQLWrapper, and, asc, desc, eq, sql } from "drizzle-orm";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { LibSQLDatabase } from "drizzle-orm/libsql";

// Types for our function parameters
type TableColumn = {
  name: string;
  table: { $tableName: string };
};

type FilterCondition<T extends TableColumn> = {
  column: T;
  value: unknown;
  operator?: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like";
};

type SortableColumn<T extends TableColumn> = {
  id: string;
  column: T;
};

type PaginatedQueryOptions<T extends TableColumn> = {
  page?: number;
  pageSize?: number;
  sorting?: SortingState;
  sortableColumns?: SortableColumn<T>[];
  filterConditions?: FilterCondition<T>[];
  countTable: { name: string };
};

export async function executePaginatedQuery<
  TQuery extends ReturnType<LibSQLDatabase["select"]> | ReturnType<LibSQLDatabase["$dynamic"]["select"]>,
  TResult
>(
  baseQuery: TQuery,
  options: PaginatedQueryOptions<TableColumn>,
  resultTransformer?: (results: any[]) => TResult[]
): Promise<{
  results: TResult[];
  total: number;
}> {
  const {
    page = 1,
    pageSize = 10,
    sorting = [],
    sortableColumns = [],
    filterConditions = [],
    countTable,
  } = options;

  console.log(`Executing paginated query for page ${page}, size ${pageSize}`);

  // Apply filters
  let queryWithFilters = baseQuery;
  
  const conditions: SQL<unknown>[] = filterConditions
    .filter(condition => condition.value !== undefined && condition.value !== 0)
    .map(({ column, value, operator = "eq" }) => {
      switch (operator) {
        case "eq":
          return eq(column, value);
        // Add other operators as needed
        default:
          return eq(column, value);
      }
    });

  if (conditions.length > 0) {
    // @ts-ignore - Drizzle typing issue
    queryWithFilters = queryWithFilters.where(and(...conditions));
  }

  // Apply sorting
  const orderByConditions: SQL<unknown>[] = sorting
    .map(sort => {
      const sortableColumn = sortableColumns.find(col => col.id === sort.id);
      if (!sortableColumn) return null;
      
      return sort.desc 
        ? desc(sortableColumn.column) 
        : asc(sortableColumn.column);
    })
    .filter((condition): condition is SQL<unknown> => condition !== null);

  let finalQuery = queryWithFilters;
  
  if (orderByConditions.length > 0) {
    // @ts-ignore - Drizzle typing issue
    finalQuery = finalQuery.orderBy(...orderByConditions);
  }

  // Apply pagination
  // @ts-ignore - Drizzle typing issue
  finalQuery = finalQuery
    .offset((page - 1) * pageSize)
    .limit(pageSize);

  // Execute query and count total
  const [results, totalResults] = await Promise.all([
    finalQuery,
    db.select({ count: sql<number>`count(*)` }).from(countTable),
  ]);

  // Transform results if needed
  const transformedResults = resultTransformer 
    ? resultTransformer(results) 
    : (results as unknown as TResult[]);

  return {
    results: transformedResults,
    total: totalResults[0].count,
  };
}
