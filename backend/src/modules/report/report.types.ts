export interface ReportDataset {
  name: string;
  data: number[];
  color?: string;
}

export interface RechartsSeriesResponse {
  labels: string[];
  datasets: ReportDataset[];
}

export interface ReportQueryParams {
  year?: number;
  month?: number;
  quarter?: number;
  period?: 'month' | 'quarter' | 'year';
}
