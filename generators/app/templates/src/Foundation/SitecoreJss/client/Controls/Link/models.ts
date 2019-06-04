import * as Models from '../../models';

interface LinkFieldValue {
  href: string;
  text: string;
  linktype: string;
  url: string;
  class?: string;
  anchor?: string;
  target?: string;
}

export interface LinkField extends Models.Field<LinkFieldValue> {}

export interface LinkProps {
  field: LinkField;
  [key: string]: any; // TODO: remove as it a typing workaround
}
