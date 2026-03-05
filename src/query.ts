import { CoercionMode, QuaeroJoinType, SelectOperatorType } from './enums';
import { IFilter, ISelect } from './types';

export interface QuerySelectObject {
  field: ISelect;
  alias?: string;
  groupBy?: boolean;
  operatorType?: SelectOperatorType;
}

export interface QueryOrderObject {
  field: ISelect;
  operatorType?: SelectOperatorType;
  ascending: boolean;
  entityName?: string;
  entityAlias?: string;
}

export interface QueryJoinParamsObject {
  mainParam: string;
  joinParam: string;
}

export interface QueryJoinObject {
  mainTableName: string;
  joinTableName: string;
  joinTableAlias?: string;
  joinSelects?: QuerySelectObject[];
  joinSummatorySelects?: QuerySelectObject[];
  joinParamTuples?: QueryJoinParamsObject[];
  joinFilter?: IFilter;
}

export interface QueryMultiJoinObject {
  joinTableName: string;
  joinTableAlias?: string;
  joinSelects?: QuerySelectObject[];
  joinSummatorySelects?: QuerySelectObject[];
  joinParamTuples?: QueryJoinParamsObject[];
  joinFilter?: IFilter;
}

export interface QueryJoinTypesObject {
  param: string;
  joinType: QuaeroJoinType[];
}

export interface Query {
  tableName: string;
  tableAlias?: string;
  coercionMode?: CoercionMode;
  selects?: QuerySelectObject[];
  filter?: IFilter;
  orders?: QueryOrderObject[];
  pageIndex?: number;
  pageSize?: number;
  dynamicJoins?: QueryJoinObject[];
  dynamicJoinsMultiple?: QueryMultiJoinObject[];
  paramJoinTypes?: QueryJoinTypesObject[];
  distinctResults?: boolean;
}
