import * as Models from '../../models';

interface ImageFieldValue {
  src: string;
  alt: string;
  width: string;
  height: string;
  style: any; // TODO: remove as it a typing workaround
}

export interface ImageField extends Models.Field<ImageFieldValue> {}

export interface ImageProps {
  media: ImageField;
  [key: string]: any; // TODO: remove as it a typing workaround
}
