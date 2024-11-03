'use client';

import { useState } from 'react';
import { PriceResult } from '@/types';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

interface ResultsListProps {
  results: PriceResult[];
  procedureName: string;
  zipCode: string;
}

export default function ResultsList({ results, procedureName, zipCode }: ResultsListProps) {
  const [sortAscending, setSortAscending] = useState(true);
  const router = useRouter();

  const sortedResults = [...results].sort((a, b) => {
    return sortAscending 
      ? (a.negotiated_rate || 0) - (b.negotiated_rate || 0)
      : (b.negotiated_rate || 0) - (a.negotiated_rate || 0);
  });

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          No results found
        </h2>
        <p className="mt-2 text-gray-600">
          Try adjusting your search criteria or selecting a different procedure.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Prices for {procedureName} near {zipCode}
        </h2>
        <button
          onClick={() => setSortAscending(!sortAscending)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white rounded-md border hover:bg-gray-50"
        >
          Sort by price
          {sortAscending ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="space-y-6">
        {sortedResults.map((result, index) => (
          <div
            key={`${result.organization_name}-${index}`}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              {result.organization_name}
            </h3>
            <p className="text-gray-600 mt-1">
              {result.address_line_1}, {result.city}, {result.state} {result.zip_code}
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">
                ${typeof result.negotiated_rate === 'number' ? result.negotiated_rate.toFixed(2) : 'N/A'}
              </span>
              <span className="text-sm text-gray-500">
                ({result.billing_class}
                {result.billing_code_modifier && ` - ${result.billing_code_modifier}`})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}