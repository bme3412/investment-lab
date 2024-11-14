// src/app/page.js


export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to Investment Lab
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
        Advanced investment analysis and screening tools to help you make data-driven investment decisions
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        {/* Feature highlights */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Investment Screening</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Advanced filters and natural language search for finding investment opportunities
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Business Model Analysis</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Track and analyze business model transitions and their impact
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Margin Analysis</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Deep dive into company margins and peer comparisons
          </p>
        </div>
      </div>
    </div>
  );
}