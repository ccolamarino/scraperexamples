import IReport from '../interfaces/report'

export interface INormalizer {
  (report: IReport): IReport
}

export type TNormalizers = INormalizer[]

export const normalize = (report: IReport, normalizers: TNormalizers) =>
  normalizers.reduce((newReport, normalizer) => normalizer(newReport), report)
