import {
  ArithmeticOperationType,
  NumericOperationType,
  QuaeroJoinType,
  SelectConverterType,
  SelectOperatorType,
  TrimSpec,
} from './enums';
import {
  IFilter,
  ISelect,
  SelectArithmetic,
  SelectCoalesce,
  SelectConcat,
  SelectConditional,
  SelectConditionValue,
  SelectFunction,
  SelectInnerSubselect,
  SelectNumericOperation,
  SelectSimple,
  SelectSubstring,
  SelectTrim,
  SelectValue,
} from './types';

/**
 * Factory helpers for building ISelect expressions.
 * Mirror of the Java `Selects` utility class.
 */
export const Selects = {
  /** Simple field path, e.g. "vehicle.brand.name" */
  field(fieldPath: string, joinTypes?: QuaeroJoinType[]): SelectSimple {
    const s: SelectSimple = { '@type': 'SelectSimple', field: fieldPath };
    if (joinTypes && joinTypes.length > 0) s.joinTypes = joinTypes;
    return s;
  },

  /** Simple field path scoped to a specific entity alias (multi-root queries) */
  fieldAs(fieldPath: string, entityAlias: string, joinTypes?: QuaeroJoinType[]): SelectSimple {
    const s: SelectSimple = { '@type': 'SelectSimple', field: fieldPath, entityAlias };
    if (joinTypes && joinTypes.length > 0) s.joinTypes = joinTypes;
    return s;
  },

  /** Literal value (string, number, boolean, null) */
  value(val: unknown): SelectValue {
    return { '@type': 'SelectValue', value: val };
  },

  /** Addition of two or more expressions */
  add(...fields: ISelect[]): SelectArithmetic {
    return { '@type': 'SelectArithmetic', operation: ArithmeticOperationType.SUMMATION, fields };
  },

  /** Subtraction (first − rest) */
  subtract(...fields: ISelect[]): SelectArithmetic {
    return { '@type': 'SelectArithmetic', operation: ArithmeticOperationType.DIFFERENCE, fields };
  },

  /** Multiplication of two or more expressions */
  multiply(...fields: ISelect[]): SelectArithmetic {
    return { '@type': 'SelectArithmetic', operation: ArithmeticOperationType.MULTIPLY, fields };
  },

  /** Division (first / rest) */
  divide(...fields: ISelect[]): SelectArithmetic {
    return { '@type': 'SelectArithmetic', operation: ArithmeticOperationType.DIVISION, fields };
  },

  /** Modulo (first % second) */
  mod(...fields: ISelect[]): SelectArithmetic {
    return { '@type': 'SelectArithmetic', operation: ArithmeticOperationType.MOD, fields };
  },

  /** COALESCE(a, b, ...) — returns first non-null value */
  coalesce(...values: ISelect[]): SelectCoalesce {
    return { '@type': 'SelectCoalesce', values };
  },

  /** String concatenation of the given expressions */
  concat(...values: ISelect[]): SelectConcat {
    return { '@type': 'SelectConcat', values };
  },

  /** CASE WHEN ... THEN ... ELSE ... END */
  caseWhen(conditions: SelectConditionValue[], otherwise: ISelect): SelectConditional {
    return { '@type': 'SelectConditional', conditions, otherwise };
  },

  /** Builds a single WHEN/THEN pair for use inside caseWhen() */
  when(condition: IFilter, then: ISelect): SelectConditionValue {
    return { condition, value: then };
  },

  /** Portable DB function call (e.g. "quaero_format_date") */
  fn(functionName: string, returnType: string, ...params: ISelect[]): SelectFunction {
    return { '@type': 'SelectFunction', function: functionName, returnType, params };
  },

  /** ABS(field) */
  abs(field: ISelect): SelectNumericOperation {
    return { '@type': 'SelectNumericOperation', operation: NumericOperationType.ABSOLUTE, field };
  },

  /** SQRT(field) */
  sqrt(field: ISelect): SelectNumericOperation {
    return { '@type': 'SelectNumericOperation', operation: NumericOperationType.SQUARE_ROOT, field };
  },

  /** Unary negation: -field */
  neg(field: ISelect): SelectNumericOperation {
    return { '@type': 'SelectNumericOperation', operation: NumericOperationType.NEGATION, field };
  },

  /** SUBSTRING(value, position [, length]) */
  substring(value: ISelect, position: number, length?: number): SelectSubstring {
    const s: SelectSubstring = { '@type': 'SelectSubstring', value, position };
    if (length !== undefined) s.length = length;
    return s;
  },

  /** TRIM([spec] [character FROM] field) */
  trim(field: ISelect, spec?: TrimSpec, character?: string): SelectTrim {
    const s: SelectTrim = { '@type': 'SelectTrim', field };
    if (spec) s.spec = spec;
    if (character) s.character = character;
    return s;
  },

  /** Correlated subselect: (SELECT select FROM tableName WHERE filter) */
  subselect(tableName: string, select: ISelect, filter?: IFilter): SelectInnerSubselect {
    const s: SelectInnerSubselect = { '@type': 'SelectInnerSubselect', tableName, select };
    if (filter) s.filter = filter;
    return s;
  },

  /** Apply a type converter to a simple field expression */
  convert(field: SelectSimple, converterType: SelectConverterType): SelectSimple {
    return Object.assign({}, field, { converterType });
  },

  /** Apply an aggregate operator to a simple field expression */
  withOperator(field: SelectSimple, operatorType: SelectOperatorType): SelectSimple {
    return Object.assign({}, field, { operatorType });
  },
};
