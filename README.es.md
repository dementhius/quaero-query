# @quaero/query

Constructor de consultas TypeScript para el motor backend [Quaero JPA](https://github.com/dementhius/quaero-jpa).

Construye objetos de consulta con tipado completo desde el navegador o desde Node.js sin necesidad de escribir JSON a mano. El resultado es un objeto JavaScript plano que puede serializarse con `JSON.stringify` y enviarse directamente a un endpoint de Quaero JPA.

## Requisitos

- TypeScript ≥ 3.4 (Angular 8+, Angular 9+, y cualquier framework moderno)
- Sin dependencias en tiempo de ejecución

## Instalación

```bash
npm install @quaero/query
```

## Inicio rápido

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

// Enviar a la API
const response = await fetch('/api/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(query),
});
```

## API

### `QueryBuilder`

Punto de entrada principal. Todos los métodos devuelven `this` (excepto `select()`) para poder encadenarse libremente.

```typescript
QueryBuilder.for(tableName: string): QueryBuilder
```

| Método | Descripción |
|---|---|
| `.alias(name)` | Alias opcional para la entidad raíz |
| `.coercionMode(mode)` | `CoercionMode.STRICT` (por defecto) o `CoercionMode.LENIENT` |
| `.select(field)` | Añade una expresión SELECT — devuelve un `SelectStep` |
| `.filterEqual(field, value)` | WHERE field = value |
| `.filterNotEqual(field, value)` | WHERE field ≠ value |
| `.filterGreaterThan(field, value)` | WHERE field > value |
| `.filterGreaterThanOrEqual(field, value)` | WHERE field ≥ value |
| `.filterLessThan(field, value)` | WHERE field < value |
| `.filterLessThanOrEqual(field, value)` | WHERE field ≤ value |
| `.filterIsNull(field)` | WHERE field IS NULL |
| `.filterIsNotNull(field)` | WHERE field IS NOT NULL |
| `.filterIsEmpty(field)` | WHERE colección IS EMPTY |
| `.filterIsNotEmpty(field)` | WHERE colección IS NOT EMPTY |
| `.filterLike(field, pattern)` | WHERE field LIKE pattern |
| `.filterNotLike(field, pattern)` | WHERE field NOT LIKE pattern |
| `.filterIn(field, values[])` | WHERE field IN (...) |
| `.filterNotIn(field, values[])` | WHERE field NOT IN (...) |
| `.filterEqualTrim(field, value)` | EQUAL ignorando espacios en blanco |
| `.filterLikeTrim(field, pattern)` | LIKE ignorando espacios en blanco |
| `.filterInTrim(field, values[])` | IN ignorando espacios en blanco |
| `.filterAnd(callback \| ...filters)` | Agrupa condiciones con AND |
| `.filterOr(callback \| ...filters)` | Agrupa condiciones con OR |
| `.filter(IFilter)` | Añade una expresión `IFilter` directamente |
| `.orderAsc(field)` | ORDER BY field ASC |
| `.orderDesc(field)` | ORDER BY field DESC |
| `.page(index, size)` | Paginación (índice base cero) |
| `.distinct()` | Añade DISTINCT |
| `.build()` | Devuelve el objeto `Query` final |

### `SelectStep`

Devuelto por `QueryBuilder.select()`. Permite configurar la expresión antes de finalizarla.

```typescript
builder
  .select(Selects.field('price')).sum().groupBy().as('totalPrice')
  .select(Selects.field('id')).count().as('count')
  .select('status').done()   // sin alias
```

| Método | Descripción |
|---|---|
| `.as(alias)` | Establece el alias de columna y devuelve al builder |
| `.done()` | Finaliza sin alias y devuelve al builder |
| `.sum()` | Agrega SUM |
| `.count()` | Agrega COUNT |
| `.countDistinct()` | Agrega COUNT(DISTINCT ...) |
| `.avg()` | Agrega AVG |
| `.max()` | Agrega MAX |
| `.min()` | Agrega MIN |
| `.groupBy()` | Marca la expresión para GROUP BY |

### `Selects` — factoría de expresiones

Funciones de utilidad para construir expresiones `ISelect`.

```typescript
import { Selects } from '@quaero/query';
```

| Función | Descripción |
|---|---|
| `Selects.field('ruta.al.campo')` | Ruta de campo simple |
| `Selects.fieldAs('campo', 'alias')` | Campo con alias de entidad (consultas multi-raíz) |
| `Selects.value(42)` | Valor literal (string, número, booleano, null) |
| `Selects.add(a, b, ...)` | a + b + ... |
| `Selects.subtract(a, b, ...)` | a - b - ... |
| `Selects.multiply(a, b, ...)` | a * b * ... |
| `Selects.divide(a, b, ...)` | a / b / ... |
| `Selects.mod(a, b)` | a % b |
| `Selects.coalesce(a, b, ...)` | COALESCE(a, b, ...) |
| `Selects.concat(a, b, ...)` | Concatenación de cadenas |
| `Selects.caseWhen(conditions, otherwise)` | CASE WHEN ... THEN ... ELSE ... END |
| `Selects.when(condition, then)` | Construye un par WHEN/THEN |
| `Selects.fn(nombre, tipoRetorno, ...params)` | Llamada a función DB portable |
| `Selects.abs(field)` | ABS(field) |
| `Selects.sqrt(field)` | SQRT(field) |
| `Selects.neg(field)` | -field |
| `Selects.substring(field, pos, len?)` | SUBSTRING |
| `Selects.trim(field, spec?, char?)` | TRIM |
| `Selects.subselect(tabla, select, filter?)` | Subconsulta correlacionada |
| `Selects.convert(field, converterType)` | Conversión de tipo |
| `Selects.withOperator(field, operator)` | Adjunta un operador de agregado |

### `Filters` — factoría de filtros

Útil para construir objetos `IFilter` fuera de una consulta completa.

```typescript
import { Filters, FilterOperatorType } from '@quaero/query';

const f = Filters.and(
  Filters.simple('status', FilterOperatorType.EQUAL, 'Active'),
  Filters.simple('price', FilterOperatorType.GREATER_THAN, 0),
);
```

## Ejemplos

### Filtros compuestos

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

### Aritmética y agregación

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

### Expresión CASE WHEN

```typescript
const tramo = Selects.caseWhen(
  [
    Selects.when(
      Filters.simple('price', FilterOperatorType.GREATER_THAN, 50000),
      Selects.value('Premium'),
    ),
  ],
  Selects.value('Estándar'),
);

QueryBuilder.for('Sale')
  .select(tramo).as('tramo')
  .select(Selects.field('id')).count().as('count')
  .build();
```

### Funciones de fecha portables

```typescript
QueryBuilder.for('Sale')
  .select(
    Selects.fn('quaero_format_date', 'String',
      Selects.field('saleDate'),
      Selects.value('YYYY-MM'),
    )
  ).groupBy().as('mes')
  .select(Selects.field('finalPrice')).sum().as('ingresos')
  .orderAsc('mes')
  .build();
```

### Filtro por subconsulta

```typescript
import { Filters, Selects, FilterOperatorType, SelectOperatorType } from '@quaero/query';

const porEncimaDeMedia = Filters.simple(
  Selects.field('finalPrice'),
  FilterOperatorType.GREATER_THAN,
  Selects.subselect(
    'Sale',
    Selects.withOperator(Selects.field('finalPrice'), SelectOperatorType.AVERAGE),
  ),
);

QueryBuilder.for('Sale').filter(porEncimaDeMedia).build();
```

## Enumerados

Todos los valores de los enumerados se serializan a la cadena exacta esperada por el backend Quaero JPA.

| Enum | Valores |
|---|---|
| `CoercionMode` | `STRICT`, `LENIENT` |
| `FilterOperatorType` | `EQUAL`, `NOT_EQUAL`, `GREATER_THAN`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN`, `LESS_THAN_OR_EQUAL`, `IS_NULL`, `IS_NOT_NULL`, `IS_EMPTY`, `IS_NOT_EMPTY`, `LIKE`, `NOT_LIKE`, `IN`, `NOT_IN`, y variantes `*_TRIM` |
| `SelectOperatorType` | `NONE`, `SUMMATORY`, `COUNT`, `COUNT_DISTINCT`, `AVERAGE`, `MAX`, `MIN` |
| `ArithmeticOperationType` | `SUMMATION`, `DIFFERENCE`, `DIVISION`, `MULTIPLY`, `MOD` |
| `NumericOperationType` | `ABSOLUTE`, `SQUARE_ROOT`, `NEGATION`, `AVERAGE`, `SUM`, `MAX`, `MIN` |
| `SelectConverterType` | `NONE`, `BIG_INTEGER`, `BIG_DECIMAL`, `DOUBLE`, `FLOAT`, `LONG`, `INTEGER`, `STRING` |
| `QuaeroJoinType` | `INNER`, `LEFT`, `RIGHT`, `CROSS` |
| `TrimSpec` | `LEADING`, `TRAILING`, `BOTH` |

## Licencia

Apache 2.0
