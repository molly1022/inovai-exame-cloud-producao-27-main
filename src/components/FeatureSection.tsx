
import { ReactNode } from "react";

interface FeatureSectionProps {
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
  children?: ReactNode;
}

const FeatureSection = ({
  title,
  description,
  image,
  reverse = false,
  children,
}: FeatureSectionProps) => {
  return (
    <section className={`flex flex-col md:flex-row ${reverse ? "md:flex-row-reverse" : ""} items-center gap-7 sm:gap-10 py-8 sm:py-12 px-2 sm:px-0`}>
      <div className="w-full max-w-xs sm:max-w-md md:max-w-[440px] md:w-1/2 flex justify-center">
        <img
          src={image}
          alt={title}
          className="rounded-2xl shadow-2xl border-2 border-[#352565] object-cover bg-[#18182D] transition-transform duration-300 hover:scale-105 w-full"
          style={{ minHeight: 150, maxHeight: 240, height: "auto" }}
        />
      </div>
      <div className="md:w-1/2 flex flex-col items-start w-full">
        <h2 className="text-xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text mb-2 md:mb-3">
          {title}
        </h2>
        <p className="text-base md:text-lg text-gray-200 mb-1 md:mb-2">{description}</p>
        {children}
      </div>
    </section>
  );
};

export default FeatureSection;
