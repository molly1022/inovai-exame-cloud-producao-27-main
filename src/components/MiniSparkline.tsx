
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MiniSparklineProps {
  data: number[];
  color?: string;
}

const MiniSparkline = ({ data, color = "#3B82F6" }: MiniSparklineProps) => {
  // A mini chart: responsivo, no grid, no axis, line only, animated.
  const chartData = data.map((val, i) => ({ value: val, idx: i }));

  return (
    <div className="w-full h-6 flex-shrink-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 1, right: 1, left: 1, bottom: 1 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.2}
            dot={false}
            isAnimationActive={true}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniSparkline;
