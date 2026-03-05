# @quaero/query

TypeScript query builder for the [Quaero JPA](https://github.com/dementhius/quaero-jpa) backend engine.

Build type-safe query objects in the browser or in Node.js without writing raw JSON by hand. The result is a plain JavaScript object that can be serialised with `JSON.stringify` and sent directly to a Quaero JPA endpoint.

## Requirements

- TypeScript ≥ 3.4 (Angular 8+, Angular 9+, and all modern frameworks)
- No runtime dependencies

## Installation

```bash
npm install @quaero/query
```

## Quick start

```typescript
import { QueryBuilder, Selects, CoercionMode } from '@quaero/query';

const query = QueryBuilder.for('Sale')
  .alias('s')
  .coercionMode(CoercionMode.LENIENT)
  .select(Selects.field('brand.name')).as('brand')
  .select(Selects.field('finalPrice')).sum().as('revenue')
  .filterAnd(f => f
    .filterEqual('status', 'Active')
    .filterGreaterThan('finalPrice', 0)
  )
  .orderDesc('finalPrice')
  .page(0, 20)
  .build();

// Send to your API
const response = await fetch('/api/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(query),
});
```

## API

### `QueryBuilder`

The main entry point. All methods return `this` (except `select()`) so they can be chained freely.

```typescript
QueryBuilder.for(tableName: string): QueryBuilder
```

| Method | Description |
|---|---|
| `.alias(name)` | Optional alias for the root entity |
| `.coercionMode(mode)` | `CoercionMode.STRICT` (default) or `CoercionMode.LENIENT` |
| `.select(field)` | Adds a SELECT expression — returns a `SelectStep` |
| `.filterEqual(field, value)` | WHERE field = value |
| `.filterNotEqual(field, value)` | WHERE field ≠ value |
| `.filterGreaterThan(field, value)` | WHERE field > value |
| `.filterGreaterThanOrEqual(field, value)` | WHERE field ≥ value |
| `.filterLessThan(field, value)` | WHERE field < value |
| `.filterLessThanOrEqual(field, value)` | WHERE field ≤ value |
| `.filterIsNull(field)` | WHERE field IS NULL |
| `.filterIsNotNull(field)` | WHERE field IS NOT NULL |
| `.filterIsEmpty(field)` | WHERE collection IS EMPTY |
| `.filterIsNotEmpty(field)` | WHERE collection IS NOT EMPTY |
| `.filterLike(field, pattern)` | WHERE field LIKE pattern |
| `.filterNotLike(field, pattern)` | WHERE field NOT LIKE pattern |
| `.filterIn(field, values[])` | WHERE field IN (...) |
| `.filterNotIn(field, values[])` | WHERE field NOT IN (...) |
| `.filterEqualTrim(field, value)` | EQUAL after trimming whitespace |
| `.filterLikeTrim(field, pattern)` | LIKE after trimming whitespace |
| `.filterInTrim(field, values[])` | IN after trimming whitespace |
| `.filterAnd(callback \| ...filters)` | Groups conditions with AND |
| `.filterOr(callback \| ...filters)` | Groups conditions with OR |
| `.filter(IFilter)` | Adds a raw `IFilter` expression |
| `.orderAsc(field)` | ORDER BY field ASC |
| `.orderDesc(field)` | ORDER BY field DESC |
| `.page(index, size)` | Pagination (zero-based index) |
| `.distinct()` | Adds DISTINCT |
| `.build()` | Returns the final `Query` object |

### `SelectStep`

Returned by `QueryBuilder.select()`. Configure the expression before finalising it.

```typescript
builder
  .select(Selects.field('price')).sum().groupBy().as('totalPrice')
  .select(Selects.field('id')).count().as('count')
  .select('status').done()   // no alias
```

| Method | Description |
|---|---|
| `.as(alias)` | Sets the column alias and returns to the builder |
| `.done()` | Finalises without alias and returns to the builder |
| `.sum()` | SUM aggregate |
| `.count()` | COUNT aggregate |
| `.countDistinct()` | COUNT(DISTINCT ...) |
| `.avg()` | AVG aggregate |
| `.max()` | MAX aggregate |
| `.min()` | MIN aggregate |
| `.groupBy()` | Marks this expression for GROUP BY |

### `Selects` — expression factory

Helper functions to build `ISelect` expressions.

```typescript
import { Selects } from '@quaero/query';
```

| Factory | Description |
|---|---|
| `Selects.field('path.to.field')` | Simple field path |
| `Selects.fieldAs('field', 'alias')` | Field scoped to an entity alias |
| `Selects.value(42)` | Literal value (string, number, boolean, null) |
| `Selects.add(a, b, ...)` | a + b + ... |
| `Selects.subtract(a, b, ...)` | a - b - ... |
| `Selects.multiply(a, b, ...)` | a * b * ... |
| `Selects.divide(a, b, ...)` | a / b / ... |
| `Selects.mod(a, b)` | a % b |
| `Selects.coalesce(a, b, ...)` | COALESCE(a, b, ...) |
| `Selects.concat(a, b, ...)` | String concatenation |
| `Selects.caseWhen(conditions, otherwise)` | CASE WHEN ... THEN ... ELSE ... END |
| `Selects.when(condition, then)` | Builds a single WHEN/THEN pair |
| `Selects.fn(name, returnType, ...params)` | Portable DB function call |
| `Selects.abs(field)` | ABS(field) |
| `Selects.sqrt(field)` | SQRT(field) |
| `Selects.neg(field)` | -field |
| `Selects.substring(field, pos, len?)` | SUBSTRING |
| `Selects.trim(field, spec?, char?)` | TRIM |
| `Selects.subselect(table, select, filter?)` | Correlated subselect |
| `Selects.convert(field, converterType)` | Type cast |
| `Selects.withOperator(field, operator)` | Attach aggregate operator |

### `Filters` — standalone filter factory

Useful for building `IFilter` objects outside of a full query.

```typescript
import { Filters, FilterOperatorType } from '@quaero/query';

const f = Filters.and(
  Filters.simple('status', FilterOperatorType.EQUAL, 'Active'),
  Filters.simple('price', FilterOperatorType.GREATER_THAN, 0),
);
```

## Examples

### Composite filters

```typescript
QueryBuilder.for('Product')
  .filterOr(f => f
    .filterEqual('category', 'Electronics')
    .filterEqual('category', 'Computers')
  )
  .filterAnd(
    Filters.simple('stock', FilterOperatorType.GREATER_THAN, 0),
    Filters.simple('active', FilterOperatorType.EQUAL, true),
  )
  .build();
```

### Arithmetic and aggregation

```typescript
QueryBuilder.for('OrderLine')
  .select(Selects.field('product.name')).groupBy().as('product')
  .select(Selects.multiply(
    Selects.field('quantity'),
    Selects.field('unitPrice'),
  )).sum().as('totalRevenue')
  .select(Selects.field('id')).count().as('lines')
  .orderDesc('totalRevenue')
  .build();
```

### CASE WHEN expression

```typescript
const tier = Selects.caseWhen(
  [
    Selects.when(
      Filters.simple('price', FilterOperatorType.GREATER_THAN, 50000),
      Selects.value('Premium'),
    ),
  ],
  Selects.value('Standard'),
);

QueryBuilder.for('Sale')
  .select(tier).as('tier')
  .select(Selects.field('id')).count().as('count')
  .build();
```

### Portable date functions

```typescript
QueryBuilder.for('Sale')
  .select(
    Selects.fn('quaero_format_date', 'String',
      Selects.field('saleDate'),
      Selects.value('YYYY-MM'),
    )
  ).groupBy().as('month')
  .select(Selects.field('finalPrice')).sum().as('revenue')
  .orderAsc('month')
  .build();
```

### Subquery filter

```typescript
import { Filters, Selects, FilterOperatorType } from '@quaero/query';

const aboveAverage = Filters.simple(
  Selects.field('finalPrice'),
  FilterOperatorType.GREATER_THAN,
  Selects.subselect(
    'Sale',
    Selects.withOperator(Selects.field('finalPrice'), SelectOperatorType.AVERAGE),
  ),
);

QueryBuilder.for('Sale').filter(aboveAverage).build();
```

## Enums

All enum values serialise to the exact string expected by the Quaero JPA backend.

| Enum | Values |
|---|---|
| `CoercionMode` | `STRICT`, `LENIENT` |
| `FilterOperatorType` | `EQUAL`, `NOT_EQUAL`, `GREATER_THAN`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN`, `LESS_THAN_OR_EQUAL`, `IS_NULL`, `IS_NOT_NULL`, `IS_EMPTY`, `IS_NOT_EMPTY`, `LIKE`, `NOT_LIKE`, `IN`, `NOT_IN`, and `*_TRIM` variants |
| `SelectOperatorType` | `NONE`, `SUMMATORY`, `COUNT`, `COUNT_DISTINCT`, `AVERAGE`, `MAX`, `MIN` |
| `ArithmeticOperationType` | `SUMMATION`, `DIFFERENCE`, `DIVISION`, `MULTIPLY`, `MOD` |
| `NumericOperationType` | `ABSOLUTE`, `SQUARE_ROOT`, `NEGATION`, `AVERAGE`, `SUM`, `MAX`, `MIN` |
| `SelectConverterType` | `NONE`, `BIG_INTEGER`, `BIG_DECIMAL`, `DOUBLE`, `FLOAT`, `LONG`, `INTEGER`, `STRING` |
| `QuaeroJoinType` | `INNER`, `LEFT`, `RIGHT`, `CROSS` |
| `TrimSpec` | `LEADING`, `TRAILING`, `BOTH` |

## License

Apache 2.0
