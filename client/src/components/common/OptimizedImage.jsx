import React from "react";

const OptimizedImage = ({ srcSet, alt, className, style }) => {
  return (
    <picture>
      <source
        srcSet={srcSet.large}
        type="image/webp"
        media="(min-width: 1024px)"
      />
      <source
        srcSet={srcSet.medium}
        type="image/webp"
        media="(min-width: 600px)"
      />
      <source srcSet={srcSet.thumbnail} type="image/webp" />
      <img
        src={srcSet.medium}
        alt={alt}
        loading="lazy"
        className={className}
        style={{ width: "100%", height: "auto", objectFit: "cover", ...style }}
      />
    </picture>
  );
};

export default OptimizedImage;
