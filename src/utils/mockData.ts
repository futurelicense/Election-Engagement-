import { Country, Election, Candidate, News, User, Comment } from './types';
export const MOCK_COUNTRIES: Country[] = [{
  id: '1',
  name: 'Nigeria',
  flag: '🇳🇬',
  code: 'NG'
}, {
  id: '2',
  name: 'Kenya',
  flag: '🇰🇪',
  code: 'KE'
}, {
  id: '3',
  name: 'South Africa',
  flag: '🇿🇦',
  code: 'ZA'
}, {
  id: '4',
  name: 'Ghana',
  flag: '🇬🇭',
  code: 'GH'
}, {
  id: '5',
  name: 'Ethiopia',
  flag: '🇪🇹',
  code: 'ET'
}, {
  id: '6',
  name: 'Tanzania',
  flag: '🇹🇿',
  code: 'TZ'
}, {
  id: '7',
  name: 'Uganda',
  flag: '🇺🇬',
  code: 'UG'
}, {
  id: '8',
  name: 'Senegal',
  flag: '🇸🇳',
  code: 'SN'
}];
export const MOCK_ELECTIONS: Election[] = [{
  id: 'e1',
  countryId: '1',
  type: 'Presidential',
  date: '2025-02-15',
  status: 'upcoming',
  description: 'Nigerian Presidential Election 2025'
}, {
  id: 'e2',
  countryId: '2',
  type: 'Parliamentary',
  date: '2025-03-20',
  status: 'upcoming',
  description: 'Kenyan Parliamentary Elections 2025'
}, {
  id: 'e3',
  countryId: '3',
  type: 'Presidential',
  date: '2025-05-10',
  status: 'upcoming',
  description: 'South African Presidential Election 2025'
}, {
  id: 'e4',
  countryId: '4',
  type: 'Presidential',
  date: '2025-04-05',
  status: 'upcoming',
  description: 'Ghana Presidential Election 2025'
}, {
  id: 'e7',
  countryId: '7',
  type: 'Presidential',
  date: '2025-01-28',
  status: 'upcoming',
  description: 'Uganda Presidential Election 2025'
}];
export const MOCK_CANDIDATES: Candidate[] = [{
  id: 'c1',
  electionId: 'e1',
  name: 'Adebayo Okonkwo',
  party: 'Progressive Alliance',
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  bio: 'Former Governor with 15 years of public service experience',
  color: '#10B981'
}, {
  id: 'c2',
  electionId: 'e1',
  name: 'Chioma Nwankwo',
  party: 'Democratic Movement',
  image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
  bio: 'Senator and advocate for education reform',
  color: '#3B82F6'
}, {
  id: 'c3',
  electionId: 'e1',
  name: 'Ibrahim Musa',
  party: 'National Unity Party',
  image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  bio: 'Business leader focused on economic development',
  color: '#F59E0B'
}, {
  id: 'c4',
  electionId: 'e2',
  name: 'Amina Wanjiku',
  party: 'Kenya Forward',
  image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
  bio: 'Human rights lawyer and activist',
  color: '#EF4444'
}, {
  id: 'c5',
  electionId: 'e2',
  name: 'David Kimani',
  party: 'Reform Coalition',
  image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
  bio: 'Former Minister of Finance',
  color: '#10B981'
}, {
  id: 'c7',
  electionId: 'e7',
  name: 'Robert Kyagulanyi',
  party: 'National Unity Platform',
  image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
  bio: 'Musician turned politician, youth advocate',
  color: '#EF4444'
}, {
  id: 'c8',
  electionId: 'e7',
  name: 'Janet Museveni',
  party: 'National Resistance Movement',
  image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400',
  bio: 'Incumbent leader, 35 years in politics',
  color: '#F59E0B'
}, {
  id: 'c9',
  electionId: 'e7',
  name: 'Patrick Oboi Amuriat',
  party: 'Forum for Democratic Change',
  image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  bio: 'Opposition leader, reform advocate',
  color: '#3B82F6'
}];
export const MOCK_NEWS: News[] = [{
  id: 'n1',
  countryId: '1',
  electionId: 'e1',
  title: 'Presidential Debates Scheduled for January 2025',
  content: '<p>The Electoral Commission announces <strong>three presidential debates</strong> ahead of the February election. All major candidates have confirmed their participation.</p><p>The debates will cover key topics including economy, healthcare, and education reform.</p>',
  image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800',
  tags: ['debate', 'presidential'],
  hashtags: ['Election2025', 'PresidentialDebate', 'Democracy'],
  priority: 'important',
  timestamp: new Date().toISOString()
}, {
  id: 'n2',
  countryId: '1',
  electionId: 'e1',
  title: 'Voter Registration Reaches Record High',
  content: "<p>Over <strong>95 million citizens</strong> have registered to vote in the upcoming presidential election, marking the highest turnout in the nation's history.</p>",
  tags: ['registration', 'turnout'],
  hashtags: ['VoterRegistration', 'RecordTurnout', 'YouthVote'],
  priority: 'breaking',
  timestamp: new Date(Date.now() - 86400000).toISOString()
}, {
  id: 'n3',
  countryId: '2',
  electionId: 'e2',
  title: 'Parliamentary Candidates Release Manifestos',
  content: '<p>Major parties unveil their policy platforms focusing on <em>healthcare and education reform</em>. Detailed manifestos are now available online.</p><ul><li>Universal healthcare coverage</li><li>Free primary education</li><li>Infrastructure development</li></ul>',
  tags: ['manifesto', 'policy'],
  hashtags: ['PolicyMatters', 'Manifesto2025', 'ChangeIsHere'],
  priority: 'general',
  timestamp: new Date(Date.now() - 172800000).toISOString()
}, {
  id: 'n4',
  countryId: '1',
  electionId: 'e1',
  title: 'International Observers Arrive for Election Monitoring',
  content: '<p>Teams from the <strong>African Union</strong> and <strong>Commonwealth</strong> have arrived to ensure free and fair elections.</p>',
  image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
  tags: ['observers', 'international'],
  hashtags: ['FairElections', 'Transparency', 'Democracy'],
  priority: 'general',
  timestamp: new Date(Date.now() - 259200000).toISOString()
}, {
  id: 'n5',
  countryId: '1',
  electionId: 'e1',
  title: 'Youth Voter Turnout Expected to Break Records',
  content: '<p>Analysis shows unprecedented engagement from voters aged 18-35, with social media campaigns driving awareness.</p><p><a href="#">Read the full report</a></p>',
  tags: ['youth', 'turnout'],
  hashtags: ['YouthVote', 'GenZVotes', 'FutureLeaders'],
  priority: 'important',
  timestamp: new Date(Date.now() - 345600000).toISOString()
}];
export const MOCK_COMMENTS: Comment[] = [{
  id: 'cm1',
  electionId: 'e1',
  userId: 'user1',
  userName: 'Amaka Johnson',
  userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  content: 'Really excited about this election! The debates will be crucial for making an informed decision.',
  timestamp: new Date(Date.now() - 3600000).toISOString(),
  likes: 24,
  likedBy: ['user2', 'user3'],
  reactions: {
    '👍': ['user2', 'user4'],
    '🔥': ['user3']
  },
  replies: [{
    id: 'cm1r1',
    electionId: 'e1',
    userId: 'user2',
    userName: 'Kwame Mensah',
    content: 'Agreed! I hope they focus on economic policies.',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    likes: 8,
    likedBy: ['user1'],
    reactions: {},
    replies: [],
    flagged: false,
    approved: true
  }],
  flagged: false,
  approved: true
}, {
  id: 'cm2',
  electionId: 'e1',
  userId: 'user3',
  userName: 'Fatima Adeyemi',
  userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  content: 'The voter registration numbers are impressive! This shows people are ready for change.',
  timestamp: new Date(Date.now() - 7200000).toISOString(),
  likes: 42,
  likedBy: ['user1', 'user2', 'user4'],
  reactions: {
    '❤️': ['user1', 'user2'],
    '🎉': ['user4']
  },
  replies: [],
  flagged: false,
  approved: true
}, {
  id: 'cm3',
  electionId: 'e1',
  userId: 'user4',
  userName: 'Chidi Okafor',
  content: "Has anyone attended the town halls? Would love to hear about the candidates' positions on healthcare.",
  timestamp: new Date(Date.now() - 10800000).toISOString(),
  likes: 15,
  likedBy: ['user3'],
  reactions: {
    '👍': ['user1']
  },
  replies: [],
  flagged: false,
  approved: true
}];
export const MOCK_USER: User = {
  id: 'user1',
  name: 'Guest User',
  email: 'guest@example.com',
  savedCountries: [],
  isAdmin: false
};