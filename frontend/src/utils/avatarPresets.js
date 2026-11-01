// Curated preset avatars for Hosters and Room Seekers

export const AVATAR_PRESETS = [
  {
    id: "host_pro_1",
    label: "Professional Host (Male)",
    role: "owner",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "host_pro_2",
    label: "Professional Host (Female)",
    role: "owner",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "seeker_young_1",
    label: "Friendly Seeker (Female)",
    role: "seeker",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "seeker_young_2",
    label: "Friendly Seeker (Male)",
    role: "seeker",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "tech_pro_1",
    label: "Tech Professional (Female)",
    role: "both",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "tech_pro_2",
    label: "Tech Professional (Male)",
    role: "both",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "student_1",
    label: "Student Resident (Male)",
    role: "seeker",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "student_2",
    label: "Student Resident (Female)",
    role: "seeker",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "manager_1",
    label: "Property Manager",
    role: "owner",
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "vector_1",
    label: "Minimalist Modern (A)",
    role: "both",
    url: "https://api.dicebear.com/7.x/personas/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9"
  },
  {
    id: "vector_2",
    label: "Minimalist Modern (B)",
    role: "both",
    url: "https://api.dicebear.com/7.x/personas/svg?seed=Aria&backgroundColor=ffd5dc,ffdfbf"
  },
  {
    id: "vector_3",
    label: "Minimalist Modern (C)",
    role: "both",
    url: "https://api.dicebear.com/7.x/personas/svg?seed=Leo&backgroundColor=c0aede,d1d4f9"
  }
];

export const getDisplayAvatar = (avatarUrl, email = "user") => {
  if (avatarUrl && avatarUrl.trim()) {
    if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://") || avatarUrl.startsWith("data:")) {
      return avatarUrl;
    }
    // Relative upload url
    return `http://localhost:8000${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email || 'myhouse_user')}`;
};

