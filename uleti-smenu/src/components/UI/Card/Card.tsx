import React from "react";

interface CardProps {
  title: string;
  img: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ title, img, description }) => {
  return (
    <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden max-w-2xl w-80">
      <img
        src={img}
        alt={title}
        className="w-full h-48 object-cover md:w-1/3 md:h-auto"
      />
      <div className="p-4 flex flex-col justify-center">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
};

export default Card;
