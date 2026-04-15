import industries from '@/src/data/industries.json';
import overview from '@/src/data/overview.json';
import products from '@/src/data/products.json';
import stacks from '@/src/data/stacks.json';

export { industries, overview, products, stacks };

export function getKnowledgeSummary() {
  const tierCounts = products.reduce<Record<string, number>>((acc, product) => {
    acc[product.tier] = (acc[product.tier] || 0) + 1;
    return acc;
  }, {});

  return {
    industries: industries.length,
    products: products.length,
    stacks: stacks.length,
    tierCounts,
    models: overview.models,
  };
}

export function findIndustryContext(industryLabel: string | undefined) {
  if (!industryLabel) return null;
  const lowered = industryLabel.toLowerCase();
  return industries.find((item) => item.industry.toLowerCase().includes(lowered) || lowered.includes(item.industry.toLowerCase()));
}
