export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ad Library Master</h1>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Filters Sidebar */}
        <div className="col-span-3 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select className="w-full rounded-md border-gray-300 shadow-sm">
                <option value="">All Platforms</option>
                <option value="meta">Meta (Facebook & Instagram)</option>
                <option value="linkedin">LinkedIn</option>
                <option value="google">Google Ads</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advertiser
              </label>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Search by advertiser name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Search in ad text"
              />
            </div>
          </div>
        </div>
        
        {/* Results Grid */}
        <div className="col-span-9">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Ad Results</h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200">
                  Export CSV
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Placeholder for ad cards */}
              <div className="border rounded-lg p-4">
                <p className="text-gray-500 text-center">No ads found. Try adjusting your filters.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
