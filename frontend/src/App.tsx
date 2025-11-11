import Layout from "./components/Layout";
import RoutesTab from "./adapters/ui/tabs/RoutesTab";
import CompareTab from "./adapters/ui/tabs/CompareTab";
import PoolingTab from "./adapters/ui/tabs/PoolingTab";
import BankingTab from "./adapters/ui/tabs/BankingTab";
import Tabs from "./components/Tabs";

function App() {
  const tabs = [
    { name: "Routes", content: <RoutesTab /> },
    { name: "Compare", content: <CompareTab /> },
    { name: "Pooling", content: <PoolingTab /> },
    { name: "Banking", content: <BankingTab /> },
  ];

  return (
    <Layout>
      {/* Container that centers and constrains the width */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-6xl bg-white shadow-md rounded-lg p-6 sm:p-8">
          <Tabs tabs={tabs} />
        </div>
      </div>
    </Layout>
  );
}

export default App;
