import { FindOptionsSelect, FindOptionsSelectByString } from 'typeorm';

export type FindOneByField<E> = {
  select?: FindOptionsSelect<E> | FindOptionsSelectByString<E>;
  field: keyof E;
  // field: string;
  value: string | boolean | number;
  //   options?: Options<E>;
  isQueryDeleteRecord?: boolean;
};
