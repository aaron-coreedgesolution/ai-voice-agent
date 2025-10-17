import React from 'react';

type AvatarProps = {
  name?: string;
  size?: number;
  src?: string;
  className?: string;
};

const Avatar: React.FC<AvatarProps> = ({ name = 'U', size = 40, src, className = '' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return src ? (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img src={src} style={{ width: size, height: size }} className={`rounded-full ${className}`} />
  ) : (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
