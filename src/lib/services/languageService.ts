import type { Language } from '$lib/types'
import * as sdk from '@iptv-org/sdk'

export class LanguageService {
  languages = new Map<string, Language.Type>()

  constructor(rawLanguages: sdk.Types.LanguageData[]) {
    this.languages = new Map(rawLanguages.map(language => [language.code, language]))
  }

  getLanguage(code: string): Language.Type | undefined {
    return this.languages.get(code)
  }
}
