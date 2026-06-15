import Link from 'next/link';

export default function ServerErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">500</h1>
      <p className="text-gray-500">Something went wrong on our end</p>
      <Link href="/products" className="text-blue-600 hover:underline">
        Back to products
      </Link>
    </div>
  );
}
