import type { WaitForOptions } from 'puppeteer'

/* eslint-disable import/prefer-default-export */
export const DEBUGGER_OPTIONS: WaitForOptions = {
  waitUntil: 'networkidle2',
  timeout: 600000,
}
