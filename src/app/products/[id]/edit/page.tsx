import React from 'react';
import ProductEditPage from './ProductEditPage';

export function generateStaticParams() {
  return [];
}
export const dynamicParams = false;

type Props = { params: Promise<{ id: string }> };

export default function Page(props: Props) {
  return React.createElement(
    ProductEditPage as React.ComponentType<Props>,
    props
  );
}
