import ProductPage from './ProductPage';

export function generateStaticParams() {
  return [];
}
export const dynamicParams = false;

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ProductPage params={params} />;
}
