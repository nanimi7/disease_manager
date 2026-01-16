import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PainLevelChart = ({ symptoms }) => {
  // 날짜별 통증 강도 데이터 준비
  const chartData = symptoms
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(symptom => ({
      date: symptom.date,
      painLevel: symptom.painLevel,
      medication: symptom.medicationTaken ? '복용' : '미복용'
    }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">통증 강도 추이</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 12 }}
            label={{ value: '통증 강도', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="painLevel"
            stroke="#3b82f6"
            strokeWidth={2}
            name="통증 강도"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PainLevelChart;
