import { supabase } from '@/lib/supabase';
import ResultsList from '@/components/ResultsList';
import Link from 'next/link';
import { PriceResult } from '@/types';

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const insurancePlan = searchParams.insurancePlan;
  const zipCode = searchParams.zipCode;
  const billingCode = searchParams.billingCode;
  const procedureName = searchParams.procedureName;

  if (!insurancePlan || !zipCode || !billingCode || !procedureName) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Invalid Search Parameters</h1>
          <p className="mt-2 text-gray-600">Please return to the search page and try again.</p>
          <Link
            href="/"
            className="mt-4 inline-block bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const zipPrefix = zipCode.slice(0, 2);

  const { data: results, error } = await supabase
    .from(insurancePlan)
    .select('*')
    .eq('billing_code', billingCode)
    .ilike('zip_code', `${zipPrefix}%`);

  if (error) {
    console.error('Error fetching results:', error);
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Error Loading Results</h1>
          <p className="mt-2 text-gray-600">Please try again later.</p>
          <Link
            href="/"
            className="mt-4 inline-block bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Search
          </Link>
        </div>
        <ResultsList 
          results={results as PriceResult[]} 
          procedureName={procedureName}
          zipCode={zipCode}
        />
      </div>
    </div>
  );
}