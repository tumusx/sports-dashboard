export default function CategoryFilter({
  tournaments,
  selectedCategory,
  onSelectCategory
}) {
  // Extrair categorias únicas dos torneios
  const categories = Array.from(
    new Set(tournaments.map(t => t.category))
  ).sort()

  if (categories.length === 0) return null

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">
        Filter by Tournament Type
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <button
          onClick={() => onSelectCategory('all')}
          className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
            selectedCategory === 'all'
              ? 'bg-blue-600 border-blue-400 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
          }`}
        >
          🎾 All Types
        </button>
        {categories.map(category => {
          const count = tournaments.filter(t => t.category === category).length
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                selectedCategory === category
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              {category}
              <span className="text-xs opacity-75 ml-1">({count})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
