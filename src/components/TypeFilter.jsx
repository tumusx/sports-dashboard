export default function TypeFilter({ selectedType, onSelectType }) {
  const types = [
    { id: 'all', label: 'All Matches', icon: '🎾' },
    { id: 'atp', label: 'ATP', icon: '🔵' },
    { id: 'wta', label: 'WTA', icon: '🔴' },
  ]

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">
        Filter by Type
      </label>
      <div className="grid grid-cols-3 gap-2">
        {types.map(type => (
          <button
            key={type.id}
            onClick={() => onSelectType(type.id)}
            className={`p-3 rounded-lg border-2 transition-all font-medium ${
              selectedType === type.id
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <span className="mr-2">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>
    </div>
  )
}
