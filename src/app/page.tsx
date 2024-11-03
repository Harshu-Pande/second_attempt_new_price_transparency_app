import SearchForm from '@/components/SearchForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Healthcare Price Finder
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Find transparent pricing for medical procedures in your area
          </p>
        </div>
        <SearchForm />
      </div>
    </div>
  );
}