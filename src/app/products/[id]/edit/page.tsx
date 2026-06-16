import ProductEditPage from './ProductEditPage';

export function generateStaticParams() {
  return [];
}
export const dynamicParams = false;

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ProductEditPage params={params} />;
}
