import { Suspense } from 'react';
import ProductEditPage from './ProductEditPage';

export default function Page() {
  return (
    <Suspense>
      <ProductEditPage />
    </Suspense>
  );
}
