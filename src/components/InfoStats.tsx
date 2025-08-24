
interface InfoStatsProps {
  stats: { label: string; value: string | number }[];
}

const InfoStats = ({ stats }: InfoStatsProps) => (
  <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-6">
    {stats.map((s) => (
      <div key={s.label} className="bg-[#231a40]/80 rounded-lg px-6 py-5 shadow-xl border border-[#3c296c]/60 flex flex-col items-center">
        <div className="text-3xl font-bold text-purple-400">{s.value}</div>
        <div className="text-sm text-gray-300 mt-2">{s.label}</div>
      </div>
    ))}
  </div>
);

export default InfoStats;
