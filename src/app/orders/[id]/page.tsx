import React from 'react';
import OrderDetailPage from './OrderDetailPage';

export function generateStaticParams() {
  return [];
}
export const dynamicParams = false;

type Props = { params: Promise<{ id: string }> };

export default function Page(props: Props) {
  return React.createElement(
    OrderDetailPage as React.ComponentType<Props>,
    props
  );
}
