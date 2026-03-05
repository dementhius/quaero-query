import {
  ArithmeticOperationType,
  FilterArrayOperation,
  FilterOperatorType,
  NumericOperationType,
  QuaeroJoinType,
  SelectConverterType,
  SelectOperatorType,
  TrimSpec,
} from './enums';

// ─── ISelect ────────────────────────────────────────────────────────────────

export interface SelectSimple {
  '@type': 'SelectSimple';
  field: string;
  entityAlias?: string;
  operatorType?: SelectOperatorType;
  converterType?: SelectConverterType;
  joinTypes?: QuaeroJoinType[];
}

export interface SelectValue {
  '@type': 'SelectValue';
  value: unknown;
}

export interface SelectArithmetic {
  '@type': 'SelectArithmetic';
  operation: ArithmeticOperationType;
  fields: ISelect[];
}

export interface SelectCoalesce {
  '@type': 'SelectCoalesce';
  values: ISelect[];
}

export interface SelectConcat {
  '@type': 'SelectConcat';
  values: ISelect[];
}

export interface SelectConditionValue {
  condition: IFilter;
  value: ISelect;
}

export interface SelectConditional {
  '@type': 'SelectConditional';
  conditions: SelectConditionValue[];
  otherwise: ISelect;
}

export interface SelectFunction {
  '@type': 'SelectFunction';
  function: string;
  returnType: string;
  params: ISelect[];
}

export interface SelectNumericOperation {
  '@type': 'SelectNumericOperation';
  operation: NumericOperationType;
  field: ISelect;
}

export interface SelectSubstring {
  '@type': 'SelectSubstring';
  value: ISelect;
  position: number;
  length?: number;
}

export interface SelectTrim {
  '@type': 'SelectTrim';
  field: ISelect;
  character?: string;
  spec?: TrimSpec;
}

export interface SelectInnerSubselect {
  '@type': 'SelectInnerSubselect';
  tableName: string;
  select: ISelect;
  filter?: IFilter;
}

export type ISelect =
  | SelectSimple
  | SelectValue
  | SelectArithmetic
  | SelectCoalesce
  | SelectConcat
  | SelectConditional
  | SelectFunction
  | SelectNumericOperation
  | SelectSubstring
  | SelectTrim
  | SelectInnerSubselect;

// ─── IFilter ────────────────────────────────────────────────────────────────

export interface FilterSimple {
  '@type': 'FilterSimple';
  field: ISelect;
  operatorType: FilterOperatorType;
  value: ISelect;
  entityName?: string;
  entityAlias?: string;
}

export interface FilterArray {
  '@type': 'FilterArray';
  operation: FilterArrayOperation;
  filters: IFilter[];
}

export interface FilterQuery {
  '@type': 'FilterQuery';
  field: ISelect;
  operatorType: FilterOperatorType;
  queryField: ISelect;
  queryEntity: string;
  queryFilter?: IFilter;
}

export type IFilter = FilterSimple | FilterArray | FilterQuery;
