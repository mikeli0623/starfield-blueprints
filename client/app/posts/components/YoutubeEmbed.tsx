import React from "react";

interface Props {
  src: string;
}

const YoutubeEmbed = ({ src }: Props) => {
  const id = src.split("=").slice(-1)[0];

  return (
    <iframe
      className="aspect-video lg:w-[700px] md:w-[550px] w-[400px]"
      src={`https://www.youtube.com/embed/${id}`}
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Embedded youtube"
    />
  );
};

export default YoutubeEmbed;
