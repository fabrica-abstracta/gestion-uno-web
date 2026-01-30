interface AvatarProps {
  letter?: string;
}

export default function Avatar({ letter = "A" }: AvatarProps) {
  return <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-900 select-none">
    {letter}
  </div>
}
