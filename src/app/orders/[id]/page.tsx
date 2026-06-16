import OrderDetailPage from './OrderDetailPage';

export function generateStaticParams() {
  return [];
}
export const dynamicParams = false;

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <OrderDetailPage params={params} />;
}
