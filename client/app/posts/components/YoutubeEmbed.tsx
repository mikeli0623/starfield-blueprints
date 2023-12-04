import React from "react";

interface Props {
  src: string;
}

const YoutubeEmbed = ({ src }: Props) => {
  const id = src.split("=").slice(-1)[0];

  return (
    <iframe
      width="720"
      height="405"
      src={`https://www.youtube.com/embed/${id}`}
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Embedded youtube"
    />
  );
};

export default YoutubeEmbed;
