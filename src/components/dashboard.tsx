import { Users, Brain, Puzzle } from "lucide-react"

const Dashboard = () => {
  const dashboardCards = [
    {
      id: 1,
      title: "Users",
      icon: Users,
      status: "Active",
      model: "Default",
    },
    {
      id: 2,
      title: "Models",
      icon: Brain,
      status: "Active",
      model: "Default",
    },
    {
      id: 3,
      title: "Intent_Set",
      icon: Puzzle,
      status: "Active",
      model: "Default",
    },
  ]

  return (
    <div className="w-[78vw] min-h-[85vh] bg-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card) => {
          const IconComponent = card.icon
          return (
            <div key={card.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-gray-400">{card.id}</span>
                <IconComponent size={48} className="text-gray-700" />
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">{card.title}</h3>

              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">Status:</span>
                  <span className="text-green-500 font-medium">{card.status}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">Model:</span>
                  <span className="text-gray-800 font-medium">{card.model}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard