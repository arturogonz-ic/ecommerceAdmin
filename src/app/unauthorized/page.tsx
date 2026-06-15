import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">401</h1>
      <p className="text-gray-500">You are not authorized to view this page</p>
      <Link href="/login" className="text-blue-600 hover:underline">
        Go to login
      </Link>
    </div>
  );
}
