import { Suspense } from 'react';
import OrderDetailPage from './OrderDetailPage';

export default function Page() {
  return (
    <Suspense>
      <OrderDetailPage />
    </Suspense>
  );
}
