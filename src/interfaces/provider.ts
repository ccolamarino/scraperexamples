import { INormalizer } from '../normalizers'
import { Validators } from '../validators'
import IScraper from './scraper'

export default interface IProvider {
  name?: string
  scraper: IScraper
  validators?: Validators
  normalizers?: INormalizer
}
