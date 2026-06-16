import { Suspense } from 'react';
import ProductPage from './ProductPage';

export default function Page() {
  return (
    <Suspense>
      <ProductPage />
    </Suspense>
  );
}
