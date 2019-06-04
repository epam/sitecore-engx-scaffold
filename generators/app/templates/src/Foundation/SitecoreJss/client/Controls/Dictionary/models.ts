export interface DictionaryProps {
  dictionary: { [key: string]: string };
  dictionaryKey: string;
  defaultValue?: string;
  tag?: string;
  [key: string]: any; // TODO: remove as it a typing workaround
}