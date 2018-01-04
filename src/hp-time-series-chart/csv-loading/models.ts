export enum EnumCsvDataType {
  DateTime,
  literal,
  Float
}

export interface ICsvColumn {
  type: EnumCsvDataType;
  /**
   * Should this column be displayed in chart
   */
  display: boolean;
}

export interface ICsvDataLoadedContext {
  /**
   * The whole CSV file contents i.e. the text as loaded from CSV file
   */
  file: File;
}