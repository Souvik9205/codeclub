import React, { useState, useEffect } from "react";

interface Avatar {
  id: number;
  imageUrl: string;
  name: string;
}

interface AvatarSelectProps {
  onSelect: (avatarId: number) => void;
}

export const AvatarSelect: React.FC<AvatarSelectProps> = ({ onSelect }) => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);

  useEffect(() => {
    // Replace with your actual API request
    fetch("http://localhost:3000/api/v1/avatars")
      .then((response) => response.json())
      .then((data) => setAvatars(data.avatars))
      .catch((error) => console.error("Error fetching avatars:", error));
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center">Choose Your Avatar</h3>
      <div className="grid grid-cols-3 gap-4">
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            className="cursor-pointer"
            onClick={() => onSelect(avatar.id)}
          >
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              className="rounded-full w-20 h-20 object-cover"
            />
            <p className="text-center mt-2">{avatar.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
