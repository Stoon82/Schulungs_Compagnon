import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * LiveResultsChart - Visualization component for quiz and poll results
 * Supports bar charts, pie charts, and word clouds with customizable colors
 */
function LiveResultsChart({ data, type = 'bar', title = 'Results' }) {
  const COLORS = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/5 rounded-lg p-6 text-center">
        <p className="text-gray-400">Keine Daten verfügbar</p>
      </div>
    );
  }

  if (type === 'wordcloud') {
    // Transform data for word cloud (expects array of {text, value})
    const words = data.map(item => ({
      text: item.name || item.text,
      value: item.value || item.count || 1
    }));

    // Find max value for scaling
    const maxValue = Math.max(...words.map(w => w.value));
    
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex flex-wrap gap-3 justify-center items-center p-6" style={{ minHeight: 300 }}>
          {words.map((word, index) => {
            const fontSize = 20 + (word.value / maxValue) * 40;
            const color = COLORS[index % COLORS.length];
            return (
              <span
                key={index}
                style={{
                  fontSize: `${fontSize}px`,
                  color: color,
                  fontWeight: 'bold',
                  opacity: 0.7 + (word.value / maxValue) * 0.3,
                  transition: 'all 0.3s ease'
                }}
                className="hover:opacity-100 cursor-default"
                title={`${word.text}: ${word.value}`}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#fff' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default: Bar chart
  return (
    <div className="bg-white/5 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff'
            }}
            cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
          />
          <Legend 
            wrapperStyle={{ color: '#fff' }}
          />
          <Bar 
            dataKey="value" 
            fill="#a855f7"
            radius={[8, 8, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LiveResultsChart;
