import * as Models from '../../models';

export interface TextField extends Models.Field<string> {}

export interface TextProps {
  tag?: string;
  field: TextField;
  [key: string]: any; // TODO: remove as it a typing workaround
}
