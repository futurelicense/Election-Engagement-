// Transform between frontend camelCase and backend snake_case

export function transformToBackend<T extends Record<string, any>>(obj: T): any {
  const transformed: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    transformed[snakeKey] = value;
  }
  return transformed;
}

export function transformFromBackend<T extends Record<string, any>>(obj: T): any {
  const transformed: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    transformed[camelKey] = value;
  }
  return transformed;
}

// Specific field mappings for complex objects
export function transformCountry(data: any) {
  return {
    id: data.id,
    name: data.name,
    flag: data.flag,
    code: data.code,
  };
}

export function transformElection(data: any) {
  return {
    id: data.id,
    countryId: data.country_id || data.countryId,
    type: data.type,
    date: data.date,
    status: data.status,
    description: data.description,
  };
}

export function transformCandidate(data: any) {
  return {
    id: data.id,
    electionId: data.election_id || data.electionId,
    name: data.name,
    party: data.party,
    image: data.image,
    bio: data.bio,
    color: data.color,
  };
}

export function transformNews(data: any) {
  return {
    id: data.id,
    countryId: data.country_id || data.countryId,
    electionId: data.election_id || data.electionId,
    title: data.title,
    content: data.content,
    image: data.image,
    tags: data.tags || [],
    hashtags: data.hashtags || [],
    priority: data.priority,
    timestamp: data.timestamp,
  };
}

export function transformComment(data: any) {
  return {
    id: data.id,
    electionId: data.election_id || data.electionId,
    userId: data.user_id || data.userId,
    userName: data.user_name || data.userName || 'Unknown',
    userAvatar: data.user_avatar || data.userAvatar,
    parentCommentId: data.parent_comment_id || data.parentCommentId,
    content: data.content,
    timestamp: data.timestamp,
    likes: data.likes || 0,
    likedBy: data.liked_by || data.likedBy || [],
    reactions: data.reactions || {},
    replies: (data.replies || []).map(transformComment),
    flagged: data.flagged || false,
    approved: data.approved !== false,
  };
}

export function transformChatRoom(data: any) {
  return {
    id: data.id,
    type: data.type,
    entityId: data.entity_id || data.entityId,
    name: data.name,
    description: data.description,
    moderators: data.moderators || [],
    pinnedMessages: data.pinned_messages || data.pinnedMessages || [],
    createdAt: data.created_at || data.createdAt,
    activeUsers: data.active_users || data.activeUsers || 0,
  };
}

export function transformChatMessage(data: any) {
  return {
    id: data.id,
    roomId: data.room_id || data.roomId,
    userId: data.user_id || data.userId,
    userName: data.user_name || data.userName || 'Unknown',
    userAvatar: data.user_avatar || data.userAvatar,
    content: data.content,
    timestamp: data.timestamp,
    reactions: data.reactions || {},
    flagged: data.flagged || false,
    deleted: data.deleted || false,
    isPinned: data.is_pinned || data.isPinned || false,
  };
}

