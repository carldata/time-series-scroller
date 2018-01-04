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

/**
 * Object implementing this interface will be passed to action responsible for loading CSV.  
 * Declares columns and their data types than should be found in CSV file, also
 * declared what columns should be loaded
 */
export interface ICsvRawParseConfiguration {
  columns: ICsvColumn[];
  /**
   * What is the delimiter character of CSV data 
   */
  delimiter: string;
  newLineCharacter: string;
  /**
   * Set to true if first line of CSV file contains headers for columns.
   * Set to false if otherwise, or if you are not sure (CSV parsing algorithm is immune to problems like this)
   */
  firstLineContainsHeaders: boolean;
}

export interface ICsvDataLoadedContext {
  /**
   * The whole CSV file contents i.e. the text as loaded from CSV file
   */
  file: File;
  config: ICsvRawParseConfiguration;
}