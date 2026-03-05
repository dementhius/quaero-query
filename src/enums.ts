export enum CoercionMode {
  STRICT = 'STRICT',
  LENIENT = 'LENIENT',
}

export enum FilterOperatorType {
  EQUAL = 'Eq',
  NOT_EQUAL = 'NtEq',
  GREATER_THAN = 'Gr',
  GREATER_THAN_OR_EQUAL = 'GrEq',
  LESS_THAN = 'Ls',
  LESS_THAN_OR_EQUAL = 'LsEq',
  IS_NULL = 'Nl',
  IS_NOT_NULL = 'NtNl',
  IS_EMPTY = 'Emp',
  IS_NOT_EMPTY = 'NtEmp',
  LIKE = 'Lk',
  NOT_LIKE = 'NtLk',
  IN = 'In',
  NOT_IN = 'NtIn',
  EQUAL_TRIM = 'EqTr',
  NOT_EQUAL_TRIM = 'NtEqTr',
  LIKE_TRIM = 'LkTr',
  NOT_LIKE_TRIM = 'NtLkTr',
  IN_TRIM = 'InTr',
  NOT_IN_TRIM = 'NtInTr',
}

export enum SelectOperatorType {
  NONE = 'None',
  SUMMATORY = 'Sum',
  COUNT = 'Cnt',
  COUNT_DISTINCT = 'CntDst',
  AVERAGE = 'Avg',
  MAX = 'Max',
  MIN = 'Min',
}

export enum ArithmeticOperationType {
  SUMMATION = 'Sum',
  DIFFERENCE = 'Diff',
  DIVISION = 'Div',
  MULTIPLY = 'Prod',
  MOD = 'Mod',
}

export enum NumericOperationType {
  AVERAGE = 'Avg',
  ABSOLUTE = 'Abs',
  SQUARE_ROOT = 'Sqrt',
  MAX = 'Max',
  MIN = 'Min',
  NEGATION = 'Not',
  SUM = 'Sum',
}

export enum SelectConverterType {
  NONE = 'None',
  BIG_INTEGER = 'BInt',
  BIG_DECIMAL = 'BDec',
  DOUBLE = 'Dbl',
  FLOAT = 'Fl',
  LONG = 'Lng',
  INTEGER = 'Int',
  STRING = 'Str',
}

export enum QuaeroJoinType {
  CROSS = 'Cross',
  LEFT = 'Left',
  RIGHT = 'Right',
  INNER = 'Inner',
}

export enum TrimSpec {
  LEADING = 'LEADING',
  TRAILING = 'TRAILING',
  BOTH = 'BOTH',
}

export enum FilterArrayOperation {
  AND = 'and',
  OR = 'or',
}
