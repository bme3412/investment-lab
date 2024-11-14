'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  PieChart, 
  BarChart3, 
  Layers,
  ChevronDown,
  ChevronRight,
  Cpu,
  Cloud,
  Smartphone,
  Monitor,
  Share2,
  TrendingUp,
  Building,
  LineChart
} from 'lucide-react';

const sectors = {
  semiconductors: {
    label: 'Semiconductors',
    icon: <Cpu className="w-4 h-4" />,
    companies: ['NVDA', 'AMD', 'INTC', 'TSM', 'AVGO']
  },
  software: {
    label: 'Software',
    icon: <Cloud className="w-4 h-4" />,
    companies: ['MSFT', 'ORCL', 'CRM', 'ADBE', 'NOW']
  },
  hardware: {
    label: 'Hardware',
    icon: <Monitor className="w-4 h-4" />,
    companies: ['AAPL', 'HPQ', 'DELL', 'WDC', 'STX']
  },
  internet: {
    label: 'Internet',
    icon: <Share2 className="w-4 h-4" />,
    companies: ['GOOGL', 'META', 'AMZN', 'NFLX', 'UBER']
  }
};

const categories = {
    Macro: {
      icon: <TrendingUp className="w-5 h-5" />,
      items: [
        { href: '/macro/overview', label: 'Market Overview' },
        { href: '/macro/trends', label: 'Economic Trends' }
      ]
    },
    Equities: {
      icon: <LineChart className="w-5 h-5" />,
      items: [
        { href: '/equities/inflection', label: 'Market Inflection Points' },
        { href: '/equities/growth-value', label: 'Growth vs Value' },
        { href: '/equities/semiconductor-cycle', label: 'Semiconductor Cycle' }, 
        { href: '/equities/earnings', label: 'Earnings by Sector' },
        { href: '/equities/valuation', label: 'Valuation' }
      ]
    },
    Companies: {
      icon: <Building className="w-5 h-5" />,
      items: [
        { href: '/search', label: 'Investment Screening' },
        { href: '/products', label: 'Product Analysis' },
        { href: '/business-model', label: 'Business Model Analysis' },
        { href: '/margins', label: 'Margin Analysis' }
      ]
    }
  };

const MainNav = () => {
  const pathname = usePathname();
  const [selectedSector, setSelectedSector] = useState('semiconductors');
  const [isSectorDropdownOpen, setSectorDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState('Companies');

  const handleCategoryClick = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <aside className="fixed left-0 top-0 w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Investment Lab
          </span>
        </Link>
      </div>

      {/* Categories Navigation */}
      <div className="py-4">
        <nav className="px-4 space-y-1">
          {Object.entries(categories).map(([category, { icon, items }]) => (
            <div key={category} className="space-y-1">
              <button
                onClick={() => handleCategoryClick(category)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  expandedCategory === category
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3">{icon}</span>
                  {category}
                </div>
                {items.length > 0 && (
                  expandedCategory === category 
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {expandedCategory === category && (
                <div className="ml-9 space-y-1">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                        pathname === item.href
                          ? 'text-blue-700 bg-blue-50 dark:bg-blue-900 dark:text-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Sector Selector */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="relative">
          <button
            onClick={() => setSectorDropdownOpen(!isSectorDropdownOpen)}
            className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <div className="flex items-center space-x-2">
              {sectors[selectedSector].icon}
              <span>{sectors[selectedSector].label}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {isSectorDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600">
              {Object.entries(sectors).map(([key, sector]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedSector(key);
                    setSectorDropdownOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-4 py-2 text-sm ${
                    selectedSector === key
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {sector.icon}
                  <span>{sector.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Market Context */}
        <div className="mt-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {selectedSector === 'semiconductors' ? 'SOX Index' : 'Sector ETF'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-600 dark:text-gray-300">
                Value: 3,456.78
              </div>
              <div className="text-green-600">
                +2.3%
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                P/E: 25.4x
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                YTD: +15.6%
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default MainNav;