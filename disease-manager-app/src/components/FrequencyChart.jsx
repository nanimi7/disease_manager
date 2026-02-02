import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const FrequencyChart = ({ symptoms }) => {
  // 요일별 발생 빈도 계산
  const dayOfWeekCount = {
    '일': 0,
    '월': 0,
    '화': 0,
    '수': 0,
    '목': 0,
    '금': 0,
    '토': 0
  };

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  symptoms.forEach(symptom => {
    const date = new Date(symptom.date);
    const dayOfWeek = dayNames[date.getDay()];
    dayOfWeekCount[dayOfWeek]++;
  });

  const chartData = Object.entries(dayOfWeekCount).map(([day, count]) => ({
    day,
    count
  }));

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">요일별 발생 빈도</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} label={{ value: '발생 횟수', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="발생 횟수" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FrequencyChart;
