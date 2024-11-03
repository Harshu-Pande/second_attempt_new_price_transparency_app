'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { INSURANCE_PLANS, ProcedureOption } from '@/types';

export default function SearchForm() {
  const router = useRouter();
  const [insurancePlan, setInsurancePlan] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [procedures, setProcedures] = useState<ProcedureOption[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load stored values from session storage
  useEffect(() => {
    const storedInsurancePlan = sessionStorage.getItem('insurancePlan');
    const storedZipCode = sessionStorage.getItem('zipCode');
    const storedSearchTerm = sessionStorage.getItem('searchTerm');

    if (storedInsurancePlan) setInsurancePlan(storedInsurancePlan);
    if (storedZipCode) setZipCode(storedZipCode);
    if (storedSearchTerm) setSearchTerm(storedSearchTerm);

    console.log('Loaded from session storage:', {
      insurancePlan: storedInsurancePlan,
      zipCode: storedZipCode,
      searchTerm: storedSearchTerm,
    });
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const fetchProcedures = async () => {
        console.log('Fetching procedures for:', searchTerm);
        
        const { data, error } = await supabase
          .from('billing_code_descriptions')
          .select('billing_code, description')
          .or(`description.ilike.%${searchTerm}%,billing_code.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) {
          console.error('Supabase error:', error);
          return;
        }

        if (data) {
          console.log('Raw data from query:', data);
          const filteredData = data
            .filter(p => p.billing_code && p.description)
            .map(item => ({
              billing_code: item.billing_code,
              plain_language_description: item.description // Map description to plain_language_description
            }));
          
          console.log('Filtered procedures:', filteredData);
          setProcedures(filteredData);
        }
      };

      const timeoutId = setTimeout(() => {
        fetchProcedures();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setProcedures([]);
    }
  }, [searchTerm]);

  const validateZipCode = (zip: string) => {
    return /^\d{5}$/.test(zip);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateZipCode(zipCode)) {
      alert('Please enter a valid 5-digit ZIP code');
      return;
    }
    if (!selectedProcedure || !insurancePlan) {
      alert('Please select all required fields');
      return;
    }

    // Log session storage before navigating
    console.log('Session storage before navigation:', {
      insurancePlan,
      zipCode,
      searchTerm,
    });

    const params = new URLSearchParams({
      insurancePlan,
      zipCode,
      billingCode: selectedProcedure.billing_code,
      procedureName: selectedProcedure.plain_language_description,
    });

    router.push(`/results?${params.toString()}`);
  };

  // Save to session storage on change
  useEffect(() => {
    sessionStorage.setItem('insurancePlan', insurancePlan);
    console.log('Updated session storage for insurancePlan:', insurancePlan);
  }, [insurancePlan]);

  useEffect(() => {
    sessionStorage.setItem('zipCode', zipCode);
    console.log('Updated session storage for zipCode:', zipCode);
  }, [zipCode]);

  useEffect(() => {
    sessionStorage.setItem('searchTerm', searchTerm);
    console.log('Updated session storage for searchTerm:', searchTerm);
  }, [searchTerm]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Insurance Plan
        </label>
        <div className="relative">
          <select
            value={insurancePlan}
            onChange={(e) => setInsurancePlan(e.target.value)}
            className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="">Select Insurance Plan</option>
            {INSURANCE_PLANS.map((plan) => (
              <option key={plan} value={plan}>
                {plan.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          {insurancePlan && (
            <button
              type="button"
              onClick={() => setInsurancePlan('')}
              className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ZIP Code
        </label>
        <div className="relative">
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter ZIP code"
            maxLength={5}
            required
          />
          {zipCode && (
            <button
              type="button"
              onClick={() => setZipCode('')}
              className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Procedure
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search for a procedure (e.g., CT, X-RAY, MRI)"
            required
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedProcedure(null);
                setShowDropdown(false);
              }}
              className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
          
          {showDropdown && procedures.length > 0 && (
            <div 
              className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
            >
              {procedures.map((procedure) => (
                <div
                  key={procedure.billing_code}
                  onClick={() => {
                    setSelectedProcedure(procedure);
                    setSearchTerm(`${procedure.billing_code} - ${procedure.plain_language_description}`);
                    setShowDropdown(false);
                  }}
                  className="cursor-pointer hover:bg-blue-50 px-3 py-2 text-gray-900 border-b border-gray-100"
                >
                  {procedure.billing_code} - {procedure.plain_language_description}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Search
      </button>
    </form>
  );
}