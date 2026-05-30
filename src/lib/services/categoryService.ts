import type * as Category from '$lib/types/category'
import * as sdk from '@iptv-org/sdk'

export class CategoryService {
  categories = new Map<string, Category.Type>()

  constructor(rawCategories: sdk.Types.CategoryData[]) {
    this.categories = new Map(rawCategories.map(category => [category.id, category]))
  }

  getCategory(id: string): Category.Type {
    return this.categories.get(id)
  }
}
