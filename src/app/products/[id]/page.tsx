import React from 'react';
import ProductPage from './ProductPage';

export function generateStaticParams() {
  return [];
}
export const dynamicParams = false;

type Props = { params: Promise<{ id: string }> };

export default function Page(props: Props) {
  return React.createElement(
    ProductPage as React.ComponentType<Props>,
    props
  );
}
