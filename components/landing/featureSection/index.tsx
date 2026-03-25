import FeatureCard from "../featureCard";
import { features } from "@/constants/features";

export default function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-16 max-w-5xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-center text-[#e6edf3] mb-3">
        Everything you need to level up
      </h2>

      <p className="text-[#8b949e] text-center mb-12 max-w-md mx-auto">
        A full SQL learning environment right in your browser.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
}