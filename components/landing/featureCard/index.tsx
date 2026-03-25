export default function FeatureCard({ feature, index }: any) {
  const Icon = feature.icon;

  return (
    <div
      className="glass-card p-6 hover:border-indigo-500/30 transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${feature.iconBg}`}
      >
        <Icon className={`h-5 w-5 ${feature.iconColor}`} />
      </div>

      <h3 className="text-[#e6edf3] font-semibold mb-2">
        {feature.title}
      </h3>

      <p className="text-[#8b949e] text-sm leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}