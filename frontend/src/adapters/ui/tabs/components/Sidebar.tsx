// frontend/src/adapters/ui/components/Sidebar.tsx

import React from 'react';
import { useSidebarData, RoutesTabSummary, RoutesTabDetails } from '../../hooks/useSidebarData';

interface SidebarProps {
  activeTab: 'routes' | 'compare' | 'banking' | 'pooling';
  selectedItemId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, selectedItemId }) => {
  const { data, loading, error } = useSidebarData(activeTab, selectedItemId);

  const renderRoutesContent = () => {
    if (!data?.routes) return null;

    const isSummary = (d: any): d is RoutesTabSummary => 'count' in d;
    const isDetails = (d: any): d is RoutesTabDetails => 'route' in d;

    const routesData = data.routes;

    if (isSummary(routesData)) {
      return (
        <div>
          <h3 className="font-bold text-lg mb-3 text-white">Routes Summary</h3>
          <p className="text-gray-300">Total Routes: {routesData.count}</p>
          <p className="text-gray-300">Years Present: {routesData.years.join(', ')}</p>
          <p className="text-gray-300">Target Intensity: {routesData.targetIntensity} gCO₂e/MJ</p>
        </div>
      );
    }

    if (isDetails(routesData)) {
      const { route, cb } = routesData;
      const isSurplus = cb.cb_t >= 0;

      return (
        <div>
          <h3 className="font-bold text-lg mb-3 text-white">
            Route Details: {route.routeId}
          </h3>

          <p className="text-gray-300">
            GHG Intensity: {route.ghgIntensity.toFixed(4)} gCO₂e/MJ
          </p>

          <div className="mt-4 p-3 bg-gray-800 rounded">
            <h4 className="font-semibold text-gray-200">
              Compliance Balance (CB)
            </h4>

            <p
              className={isSurplus ? 'text-green-400' : 'text-red-400'}
              title="Compliance Balance in tonnes"
            >
              {cb.cb_t.toFixed(4)} tCO₂e ({isSurplus ? 'Surplus ✅' : 'Deficit ❌'})
            </p>

            <p className="text-sm text-gray-400" title="Compliance Balance in grams">
              ({cb.cb_g.toFixed(2)} gCO₂e)
            </p>

            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-gray-300">Show Formula</summary>
              <pre className="mt-2 bg-gray-900 p-3 rounded text-gray-200 overflow-x-auto">
                <code>
Energy (MJ) = {route.fuelConsumption_t} t × 41,000 MJ/t = {(route.fuelConsumption_t * 41000).toLocaleString()} MJ
CB (g) = (89.3368 - {route.ghgIntensity}) × {(route.fuelConsumption_t * 41000).toLocaleString()} = {cb.cb_g.toFixed(2)} g
                </code>
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderContent = () => {
    if (loading) return <p className="text-gray-300">Loading...</p>;
    if (error) return <p className="text-red-400">Error: {error.message}</p>;
    if (!data) return <p className="text-gray-300">No data available.</p>;

    switch (activeTab) {
      case 'routes':
        return renderRoutesContent();
      case 'compare':
        return <p className="text-gray-300">Compare tab sidebar content goes here.</p>;
      case 'banking':
        return <p className="text-gray-300">Banking tab sidebar content goes here.</p>;
      case 'pooling':
        return <p className="text-gray-300">Pooling tab sidebar content goes here.</p>;
      default:
        return null;
    }
  };

  return (
    <aside
      role="complementary"
      aria-label="Analysis sidebar"
      className="w-80 bg-gray-900 p-5 border-r border-gray-700 h-full overflow-y-auto"
    >
      <h2 className="text-xl font-bold mb-4 text-white">Analysis Sidebar</h2>
      {renderContent()}
    </aside>
  );
};

export default Sidebar;
