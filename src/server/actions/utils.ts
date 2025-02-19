import { SQL, and, asc, desc, eq, PgSelect, PgSelectQueryBuilder } from 'drizzle-orm';
import { SortingState } from '@tanstack/react-table';

type FilterCondition = SQL<unknown>;
type OrderByCondition = SQL<unknown>;

export const applyFiltersSortingAndPagination = <T extends PgSelectQueryBuilder>(
  baseQuery: T,
  filters: FilterCondition[],
  sorting: SortingState,
  page: number = 1,
  pageSize: number = 10
): { query: T; totalQuery: PgSelect } => {
  // Apply filters
  const queryWithFilters = filters.length > 0 ? baseQuery.where(and(...filters)) : baseQuery;

  // Apply sorting
  const orderByConditions: OrderByCondition[] = sorting
    .filter((sort) => sort.id === "price" || sort.id === "stock")
    .map((sort) => {
      if (sort.id === "price") {
        return sort.desc ? desc(ProductsTable.price) : asc(ProductsTable.price);
      } else if (sort.id === "stock") {
        return sort.desc ? desc(ProductsTable.stock) : asc(ProductsTable.stock);
      }
      return null;
    })
    .filter((condition): condition is OrderByCondition => condition !== null);

  const finalQuery =
    orderByConditions.length > 0
      ? queryWithFilters.orderBy(...orderByConditions)
      : queryWithFilters;

  // Apply pagination
  const paginatedQuery = finalQuery.offset((page - 1) * pageSize).limit(pageSize);

  // Create a query to get the total count of records
  const totalQuery = db.select({ count: sql<number>`count(*)` }).from(ProductsTable); 

  return { query: paginatedQuery, totalQuery };
};
