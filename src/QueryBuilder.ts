import { CoercionMode, FilterArrayOperation, FilterOperatorType, SelectOperatorType } from './enums';
import { FilterArray, FilterSimple, IFilter, ISelect, SelectValue } from './types';
import { Query, QueryOrderObject, QuerySelectObject } from './query';
import { Selects } from './Selects';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeSimpleFilter(
  field: string | ISelect,
  operatorType: FilterOperatorType,
  value?: unknown,
  entityAlias?: string,
): FilterSimple {
  const fieldExpr: ISelect =
    typeof field === 'string' ? Selects.field(field) : field;
  const valueExpr: ISelect =
    value instanceof Object && '@type' in (value as object)
      ? (value as ISelect)
      : Selects.value(value);
  const f: FilterSimple = {
    '@type': 'FilterSimple',
    field: fieldExpr,
    operatorType,
    value: valueExpr,
  };
  if (entityAlias) f.entityAlias = entityAlias;
  return f;
}

function collapseFilters(filters: IFilter[], operation: FilterArrayOperation): IFilter | undefined {
  if (filters.length === 0) return undefined;
  if (filters.length === 1) return filters[0];
  const arr: FilterArray = { '@type': 'FilterArray', operation, filters: filters.slice() };
  return arr;
}

// ─── FilterBuilder ──────────────────────────────────────────────────────────

/**
 * Collects filter conditions and combines them into a single IFilter tree.
 * Used both as the root filter accumulator inside QueryBuilder and as the
 * scoped accumulator for filterAnd / filterOr callbacks.
 */
export class FilterBuilder {
  /** @internal */
  protected _filters: IFilter[] = [];

  /** Add a raw IFilter expression directly. */
  filter(f: IFilter): this {
    this._filters.push(f);
    return this;
  }

  filterEqual(field: string | ISelect, value: unknown, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.EQUAL, value, entityAlias));
    return this;
  }

  filterNotEqual(field: string | ISelect, value: unknown, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.NOT_EQUAL, value, entityAlias));
    return this;
  }

  filterGreaterThan(field: string | ISelect, value: unknown, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.GREATER_THAN, value, entityAlias));
    return this;
  }

  filterGreaterThanOrEqual(field: string | ISelect, value: unknown, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.GREATER_THAN_OR_EQUAL, value, entityAlias));
    return this;
  }

  filterLessThan(field: string | ISelect, value: unknown, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.LESS_THAN, value, entityAlias));
    return this;
  }

  filterLessThanOrEqual(field: string | ISelect, value: unknown, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.LESS_THAN_OR_EQUAL, value, entityAlias));
    return this;
  }

  filterIsNull(field: string | ISelect, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.IS_NULL, null, entityAlias));
    return this;
  }

  filterIsNotNull(field: string | ISelect, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.IS_NOT_NULL, null, entityAlias));
    return this;
  }

  filterIsEmpty(field: string | ISelect, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.IS_EMPTY, null, entityAlias));
    return this;
  }

  filterIsNotEmpty(field: string | ISelect, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.IS_NOT_EMPTY, null, entityAlias));
    return this;
  }

  filterLike(field: string | ISelect, pattern: string, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.LIKE, pattern, entityAlias));
    return this;
  }

  filterNotLike(field: string | ISelect, pattern: string, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.NOT_LIKE, pattern, entityAlias));
    return this;
  }

  filterIn(field: string | ISelect, values: unknown[], entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.IN, values, entityAlias));
    return this;
  }

  filterNotIn(field: string | ISelect, values: unknown[], entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.NOT_IN, values, entityAlias));
    return this;
  }

  filterEqualTrim(field: string | ISelect, value: string, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.EQUAL_TRIM, value, entityAlias));
    return this;
  }

  filterNotEqualTrim(field: string | ISelect, value: string, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.NOT_EQUAL_TRIM, value, entityAlias));
    return this;
  }

  filterLikeTrim(field: string | ISelect, pattern: string, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.LIKE_TRIM, pattern, entityAlias));
    return this;
  }

  filterNotLikeTrim(field: string | ISelect, pattern: string, entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.NOT_LIKE_TRIM, pattern, entityAlias));
    return this;
  }

  filterInTrim(field: string | ISelect, values: string[], entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.IN_TRIM, values, entityAlias));
    return this;
  }

  filterNotInTrim(field: string | ISelect, values: string[], entityAlias?: string): this {
    this._filters.push(makeSimpleFilter(field, FilterOperatorType.NOT_IN_TRIM, values, entityAlias));
    return this;
  }

  /**
   * Groups multiple conditions with AND.
   *
   * Callback style (fluent):
   * ```ts
   * .filterAnd(f => f.filterEqual('status', 'Active').filterGreaterThan('price', 0))
   * ```
   *
   * Direct IFilter style:
   * ```ts
   * .filterAnd(filterA, filterB, filterC)
   * ```
   */
  filterAnd(callback: (f: FilterBuilder) => unknown): this;
  filterAnd(...filters: IFilter[]): this;
  filterAnd(arg: ((f: FilterBuilder) => unknown) | IFilter, ...rest: IFilter[]): this {
    if (typeof arg === 'function') {
      const sub = new FilterBuilder();
      arg(sub);
      const built = collapseFilters(sub._filters, FilterArrayOperation.AND);
      if (built) this._filters.push(built);
    } else {
      const all = [arg as IFilter].concat(rest);
      const built = collapseFilters(all, FilterArrayOperation.AND);
      if (built) this._filters.push(built);
    }
    return this;
  }

  /**
   * Groups multiple conditions with OR.
   *
   * Callback style (fluent):
   * ```ts
   * .filterOr(f => f.filterEqual('status', 'A').filterEqual('status', 'B'))
   * ```
   *
   * Direct IFilter style:
   * ```ts
   * .filterOr(filterA, filterB)
   * ```
   */
  filterOr(callback: (f: FilterBuilder) => unknown): this;
  filterOr(...filters: IFilter[]): this;
  filterOr(arg: ((f: FilterBuilder) => unknown) | IFilter, ...rest: IFilter[]): this {
    if (typeof arg === 'function') {
      const sub = new FilterBuilder();
      arg(sub);
      const built = collapseFilters(sub._filters, FilterArrayOperation.OR);
      if (built) this._filters.push(built);
    } else {
      const all = [arg as IFilter].concat(rest);
      const built = collapseFilters(all, FilterArrayOperation.OR);
      if (built) this._filters.push(built);
    }
    return this;
  }

  /** @internal Builds all accumulated filters into a single IFilter. */
  protected _buildFilter(): IFilter | undefined {
    return collapseFilters(this._filters, FilterArrayOperation.AND);
  }
}

// ─── SelectStep ─────────────────────────────────────────────────────────────

/**
 * Intermediate step returned by `QueryBuilder.select()`.
 * Configure the select expression before finalising it with `.as()` or `.done()`.
 *
 * ```ts
 * builder.select(Selects.field('finalPrice')).sum().groupBy().as('revenue')
 * ```
 */
export class SelectStep {
  private readonly _obj: QuerySelectObject;
  private readonly _builder: QueryBuilder;

  /** @internal */
  constructor(builder: QueryBuilder, field: ISelect) {
    this._builder = builder;
    this._obj = { field };
  }

  /** Mark this expression as GROUP BY. */
  groupBy(): this {
    this._obj.groupBy = true;
    return this;
  }

  sum(): this { this._obj.operatorType = SelectOperatorType.SUMMATORY; return this; }
  count(): this { this._obj.operatorType = SelectOperatorType.COUNT; return this; }
  countDistinct(): this { this._obj.operatorType = SelectOperatorType.COUNT_DISTINCT; return this; }
  avg(): this { this._obj.operatorType = SelectOperatorType.AVERAGE; return this; }
  max(): this { this._obj.operatorType = SelectOperatorType.MAX; return this; }
  min(): this { this._obj.operatorType = SelectOperatorType.MIN; return this; }

  /** Finalise the select with a column alias and return to the builder. */
  as(alias: string): QueryBuilder {
    this._obj.alias = alias;
    this._builder._pushSelect(this._obj);
    return this._builder;
  }

  /** Finalise the select without an alias and return to the builder. */
  done(): QueryBuilder {
    this._builder._pushSelect(this._obj);
    return this._builder;
  }
}

// ─── QueryBuilder ───────────────────────────────────────────────────────────

/**
 * Fluent builder that constructs a {@link Query} object ready to be serialised
 * to JSON and sent to the Quaero JPA backend.
 *
 * ```ts
 * const query = QueryBuilder.for('Sale')
 *   .alias('s')
 *   .coercionMode(CoercionMode.LENIENT)
 *   .select(Selects.field('brand.name')).as('brand')
 *   .select(Selects.field('finalPrice')).sum().as('revenue')
 *   .filterAnd(f => f
 *     .filterEqual('status', 'Active')
 *     .filterGreaterThan('finalPrice', 0)
 *   )
 *   .orderDesc('finalPrice')
 *   .page(0, 20)
 *   .build();
 * ```
 */
export class QueryBuilder extends FilterBuilder {
  private readonly _tableName: string;
  private _tableAlias: string | undefined;
  private _coercionMode: CoercionMode | undefined;
  private readonly _selects: QuerySelectObject[] = [];
  private readonly _orders: QueryOrderObject[] = [];
  private _pageIndex: number | undefined;
  private _pageSize: number | undefined;
  private _distinctResults: boolean | undefined;

  constructor(tableName: string) {
    super();
    this._tableName = tableName;
  }

  /** Entry point — creates a builder for the given JPA entity name. */
  static for(tableName: string): QueryBuilder {
    return new QueryBuilder(tableName);
  }

  /** Optional root alias for the main entity. */
  alias(tableAlias: string): this {
    this._tableAlias = tableAlias;
    return this;
  }

  /** Controls how the backend coerces filter values. Defaults to STRICT. */
  coercionMode(mode: CoercionMode): this {
    this._coercionMode = mode;
    return this;
  }

  /**
   * Adds a SELECT expression. Returns a {@link SelectStep} to configure
   * alias, aggregates, and GROUP BY before returning to this builder.
   *
   * ```ts
   * builder.select('id').as('saleId')
   * builder.select(Selects.field('price')).sum().as('revenue')
   * builder.select(Selects.add(Selects.field('a'), Selects.field('b'))).as('total')
   * ```
   */
  select(field: ISelect | string): SelectStep {
    const resolved: ISelect = typeof field === 'string' ? Selects.field(field) : field;
    return new SelectStep(this, resolved);
  }

  /** @internal Called by SelectStep to register a completed select object. */
  _pushSelect(s: QuerySelectObject): void {
    this._selects.push(s);
  }

  /** Adds an ORDER BY ASC clause. */
  orderAsc(field: ISelect | string, entityAlias?: string): this {
    const f: ISelect = typeof field === 'string' ? Selects.field(field) : field;
    const o: QueryOrderObject = { field: f, ascending: true };
    if (entityAlias) o.entityAlias = entityAlias;
    this._orders.push(o);
    return this;
  }

  /** Adds an ORDER BY DESC clause. */
  orderDesc(field: ISelect | string, entityAlias?: string): this {
    const f: ISelect = typeof field === 'string' ? Selects.field(field) : field;
    const o: QueryOrderObject = { field: f, ascending: false };
    if (entityAlias) o.entityAlias = entityAlias;
    this._orders.push(o);
    return this;
  }

  /** Sets pagination (zero-based page index). */
  page(pageIndex: number, pageSize: number): this {
    this._pageIndex = pageIndex;
    this._pageSize = pageSize;
    return this;
  }

  /** Adds DISTINCT to the generated query. */
  distinct(): this {
    this._distinctResults = true;
    return this;
  }

  /**
   * Produces the final {@link Query} plain object, ready for JSON serialisation.
   * The result is JSON.stringify-safe with no class instances.
   */
  build(): Query {
    const query: Query = { tableName: this._tableName };

    if (this._tableAlias !== undefined) query.tableAlias = this._tableAlias;
    if (this._coercionMode !== undefined) query.coercionMode = this._coercionMode;
    if (this._selects.length > 0) query.selects = this._selects.slice();

    const filter = this._buildFilter();
    if (filter !== undefined) query.filter = filter;

    if (this._orders.length > 0) query.orders = this._orders.slice();
    if (this._pageIndex !== undefined) query.pageIndex = this._pageIndex;
    if (this._pageSize !== undefined) query.pageSize = this._pageSize;
    if (this._distinctResults) query.distinctResults = true;

    return query;
  }
}

// Convenience re-export so users only need one import for the common path
export { Selects } from './Selects';

// Convenience factory that mirrors the Java static method name
export const queryBuilder = QueryBuilder.for.bind(QueryBuilder) as (tableName: string) => QueryBuilder;

// Convenience constructors for raw IFilter expressions (useful for building
// standalone filter objects outside of a full query).
export const Filters = {
  simple(
    field: string | ISelect,
    operatorType: FilterOperatorType,
    value?: unknown,
    entityAlias?: string,
  ): FilterSimple {
    return makeSimpleFilter(field, operatorType, value, entityAlias);
  },

  and(...filters: IFilter[]): FilterArray {
    return { '@type': 'FilterArray', operation: FilterArrayOperation.AND, filters };
  },

  or(...filters: IFilter[]): FilterArray {
    return { '@type': 'FilterArray', operation: FilterArrayOperation.OR, filters };
  },
};

// Narrow type helper: assert that an ISelect is a SelectValue carrying a primitive.
export function isSelectValue(s: ISelect): s is SelectValue {
  return s['@type'] === 'SelectValue';
}
