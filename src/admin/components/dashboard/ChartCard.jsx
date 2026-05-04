import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';
import { formatINR } from '../../../utils/currencyUtils';

const ChartCard = ({ title, type = 'area', data, dataKey = 'value', categoryKey = 'name', height = 300, color = '#3B82F6', isCurrency = false }) => {

  // Safe ID for SVG gradients
  const gradientId = React.useMemo(() => `gradient-${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`, [title]);

  // Premium Blue Shades
  // Vibrant & Distinct Palette
  const COLORS = ['#2563EB', '#10B981', '#6366F1', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'];


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const displayLabel = label || payload[0].name;

      return (
        <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 p-3.5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-2xl min-w-[160px]">
          {displayLabel && (
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-white/30 mb-2.5 border-b border-gray-100 dark:border-white/5 pb-2">
              {displayLabel}
            </p>
          )}
          <div className="space-y-2">
            {payload.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                    style={{ backgroundColor: item.color || item.fill || color }}
                  ></div>
                  <span className="text-[11px] font-bold text-gray-600 dark:text-white/60 uppercase tracking-wide">
                    {item.name || 'Value'}
                  </span>
                </div>
                <p className="text-sm font-black text-gray-900 dark:text-white">
                  {isCurrency ? formatINR(item.value) : item.value?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-transparent border border-gray-100 dark:border-white/5 rounded-2xl p-4 sm:p-8 shadow-sm hover:border-accent/30 transition-all flex flex-col min-h-[350px] sm:min-h-[400px] overflow-hidden">
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <h3 className="text-slate-500 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
          {title}
        </h3>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
        </div>
      </div>

      <div className="w-full flex-1 relative min-h-[350px]">
        {(!data || data.length === 0) ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-white/20 text-xs font-medium">
            No data available for {title}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300} debounce={50}>
            {type === 'line' ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-border)"
                  fontSize={10}
                  tick={{ fill: 'var(--color-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                  interval="preserveStartEnd"
                  minTickGap={10}
                />
                <YAxis
                  stroke="var(--color-border)"
                  fontSize={10}
                  tick={{ fill: 'var(--color-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => isCurrency ? formatINR(val).replace('₹', '') : val}
                />
                <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px', paddingBottom: '20px', color: 'var(--color-text-muted)' }} />
                {Array.isArray(dataKey) ? (
                  dataKey.map((line, idx) => (
                    <Line
                      key={line.key}
                      name={line.name}
                      type="monotone"
                      dataKey={line.key}
                      stroke={line.color}
                      strokeWidth={3}
                      dot={{ fill: line.color, r: 4 }}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                  ))
                ) : (
                  <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ fill: color, r: 4 }} isAnimationActive={false} />
                )}
              </LineChart>
            ) : type === 'pie' ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey={dataKey}
                  nameKey={categoryKey || 'name'}
                  isAnimationActive={false}
                >
                  {data?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', color: 'var(--color-text-muted)' }} />
              </PieChart>
            ) : type === 'bar' ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                <XAxis 
                  xAxisId="bottom"
                  dataKey={categoryKey || 'name'} 
                  stroke="var(--color-border)" 
                  fontSize={10} 
                  orientation="bottom"
                  tick={(props) => {
                    const { x, y, payload, index } = props;
                    if (!payload || !payload.value || index % 2 === 0) return null;
                    
                    const formattedValue = String(payload.value)
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ');

                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text x={0} y={15} textAnchor="middle" fill="var(--color-text-muted)" fontSize={9} fontWeight="bold" className="dark:fill-white/40">
                          {formattedValue.length > 12 ? formattedValue.substring(0, 10) + '...' : formattedValue}
                        </text>
                      </g>
                    );
                  }}
                  height={40}
                  axisLine={false} 
                  tickLine={false} 
                  interval={0}
                />
                <XAxis 
                  xAxisId="top"
                  dataKey={categoryKey || 'name'} 
                  stroke="var(--color-border)" 
                  fontSize={10} 
                  orientation="top"
                  tick={(props) => {
                    const { x, y, payload, index } = props;
                    if (!payload || !payload.value || index % 2 !== 0) return null;
                    
                    const formattedValue = String(payload.value)
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ');

                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text x={0} y={-15} textAnchor="middle" fill="var(--color-text-muted)" fontSize={9} fontWeight="bold" className="dark:fill-white/40">
                          {formattedValue.length > 12 ? formattedValue.substring(0, 10) + '...' : formattedValue}
                        </text>
                      </g>
                    );
                  }}
                  height={40}
                  axisLine={false} 
                  tickLine={false} 
                  interval={0}
                />
                <YAxis
                  stroke="var(--color-border)"
                  fontSize={10}
                  tick={{ fill: 'var(--color-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => isCurrency ? formatINR(val).replace('₹', '') : val}
                />
                <Tooltip
                  cursor={false}
                  content={<CustomTooltip />}
                  isAnimationActive={false}
                />
                <Bar
                  xAxisId="bottom"
                  dataKey={dataKey}
                  fill={`url(#${gradientId})`}
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                  isAnimationActive={false}
                >
                  <LabelList 
                    dataKey={dataKey} 
                    position="top" 
                    fill="var(--color-text-muted)" 
                    fontSize={10} 
                    fontWeight="bold"
                    offset={10}
                    className="dark:fill-white/60"
                  />
                </Bar>
              </BarChart>
            ) : (

              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-border)"
                  fontSize={10}
                  tick={{ fill: 'var(--color-text-muted)' }}
                  interval="preserveStartEnd"
                  minTickGap={10}
                />
                <YAxis
                  stroke="var(--color-border)"
                  fontSize={10}
                  tick={{ fill: 'var(--color-text-muted)' }}
                  tickFormatter={(val) => isCurrency ? formatINR(val).replace('₹', '') : val}
                />
                <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                <Area type="monotone" dataKey={Array.isArray(dataKey) ? dataKey[0].key : dataKey} stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#${gradientId})`} isAnimationActive={false} />
              </AreaChart>
            )}

          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};

export default ChartCard;
