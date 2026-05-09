export interface TestResult {
  passed: boolean;
  message?: string;
  expected?: string;
  actual?: string | number;
}

export interface ITestStrategy<TData> {
  name: string;
  description: string;
  
  // Calculate derived values (e.g., density, percentages)
  calculate(data: TData): TData;
  
  // Evaluate the data against a standard/norm
  evaluate(data: TData): Record<string, TestResult>;
  
  // Return the PDF view component or a data structure for PDF rendering
  generateReportData(data: TData): unknown;
}
