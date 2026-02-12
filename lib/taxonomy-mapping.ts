import type { ProductGroup } from '@/lib/metrics-data'

export interface TaxonomyNode {
  id: string
  label: string
}

export interface ProductTaxonomyRules {
  themes?: readonly string[]
  subthemesByTheme?: Readonly<Record<string, readonly string[]>>
}

const PRODUCT_TAXONOMY_RULES: Readonly<Partial<Record<ProductGroup, ProductTaxonomyRules>>> = {}

export function getAllowedThemes(productId: ProductGroup): readonly string[] | null {
  const themes = PRODUCT_TAXONOMY_RULES[productId]?.themes
  return themes && themes.length > 0 ? themes : null
}

export function filterTaxonomyByProduct<T extends TaxonomyNode>(
  productId: ProductGroup,
  nodes: readonly T[]
): T[] {
  const allowedThemes = getAllowedThemes(productId)

  if (!allowedThemes) {
    return [...nodes]
  }

  const allowedSet = new Set(allowedThemes)
  return nodes.filter((node) => allowedSet.has(node.id))
}
