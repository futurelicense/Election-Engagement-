import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ChatRoomForm } from '../../components/admin/ChatRoomForm';
import { useChat } from '../../context/ChatContext';
import { chatService } from '../../services/chatService';
import { ChatRoom, ChatMessage } from '../../utils/types';
import { MessageSquareIcon, FlagIcon, BarChart3Icon, TrashIcon, PinIcon, EditIcon, PlusIcon, UsersIcon } from 'lucide-react';

export function AdminChat() {
  const { rooms, refreshRooms } = useChat();
  const [flaggedMessages, setFlaggedMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState('rooms');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | undefined>();
  const [loading, setLoading] = useState(false);
  const [roomActivity, setRoomActivity] = useState<Record<string, any>>({});
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    loadFlaggedMessages();
    loadRoomActivity();
    // Refresh activity every 30 seconds
    const interval = setInterval(loadRoomActivity, 30000);
    return () => clearInterval(interval);
  }, [rooms]);

  const loadFlaggedMessages = async () => {
    try {
      const messages = await chatService.getFlaggedMessages();
      setFlaggedMessages(messages);
    } catch (error: any) {
      console.error('Failed to load flagged messages:', error);
    }
  };

  const loadRoomActivity = async () => {
    try {
      setLoadingActivity(true);
      const activity: Record<string, any> = {};
      
      // Get message counts and recent activity for each room
      await Promise.all(
        rooms.map(async (room) => {
          try {
            const messages = await chatService.getMessages(room.id, 100);
            const recentMessages = messages.slice(0, 5);
            const messageCount = messages.length;
            
            // Count active users (users who sent messages in last hour)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            const activeUsers = new Set(
              messages
                .filter((msg: any) => new Date(msg.timestamp) > new Date(oneHourAgo))
                .map((msg: any) => msg.userId)
            ).size;

            activity[room.id] = {
              messageCount,
              activeUsers,
              recentMessages,
              lastActivity: messages[0]?.timestamp || null,
            };
          } catch (error) {
            console.error(`Failed to load activity for room ${room.id}:`, error);
            activity[room.id] = {
              messageCount: 0,
              activeUsers: 0,
              recentMessages: [],
              lastActivity: null,
            };
          }
        })
      );
      
      setRoomActivity(activity);
    } catch (error) {
      console.error('Failed to load room activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleCreateRoom = () => {
    setSelectedRoom(undefined);
    setShowRoomForm(true);
  };

  const handleEditRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    setShowRoomForm(true);
  };

  const handleSubmitRoom = async (roomData: Partial<ChatRoom>) => {
    try {
      setLoading(true);
      if (selectedRoom) {
        await chatService.updateRoom(selectedRoom.id, roomData);
      } else {
        await chatService.createRoom({
          type: roomData.type || 'country',
          entityId: roomData.entityId || '',
          name: roomData.name || 'New Room',
          description: roomData.description,
          moderators: roomData.moderators,
        });
      }
      await refreshRooms();
      setShowRoomForm(false);
    } catch (error: any) {
      console.error('Failed to save room:', error);
      alert(error.message || 'Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this chat room? All messages will be permanently deleted.')) return;

    try {
      setLoading(true);
      await chatService.deleteRoom(roomId);
      await refreshRooms();
    } catch (error: any) {
      console.error('Failed to delete room:', error);
      alert(error.message || 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await chatService.deleteMessage(messageId);
      await loadFlaggedMessages();
    } catch (error: any) {
      console.error('Failed to delete message:', error);
      alert(error.message || 'Failed to delete message');
    }
  };

  const handlePinMessage = async (messageId: string) => {
    const message = flaggedMessages.find(m => m.id === messageId);
    if (message) {
      try {
        await chatService.updateMessage(messageId, {
          isPinned: !message.isPinned,
        });
        await loadFlaggedMessages();
      } catch (error: any) {
        console.error('Failed to pin message:', error);
        alert(error.message || 'Failed to pin message');
      }
    }
  };

  // Calculate analytics
  const totalMessages = rooms.reduce((sum, room) => {
    // This would need to fetch actual message counts from API
    return sum;
  }, 0);

  const roomColumns = [
    {
      key: 'name',
      header: 'Room Name',
      render: (room: ChatRoom) => (
        <div>
          <p className="font-medium text-gray-900">{room.name}</p>
          <div className="flex gap-2 mt-1">
            <Badge variant="info" className="text-xs">
              {room.type}
            </Badge>
            {room.moderators && room.moderators.length > 0 && (
              <Badge variant="success" className="text-xs">
                <UsersIcon className="w-3 h-3 mr-1" />
                {room.moderators.length} mods
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'activeUsers',
      header: 'Active',
      width: '100px',
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (room: ChatRoom) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEditRoom(room)}
            disabled={loading}
          >
            <EditIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteRoom(room.id)}
            disabled={loading}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const flaggedColumns = [
    {
      key: 'userName',
      header: 'User',
      width: '150px',
    },
    {
      key: 'content',
      header: 'Message',
      render: (message: ChatMessage) => (
        <p className="text-sm line-clamp-2">{message.content}</p>
      ),
    },
    {
      key: 'timestamp',
      header: 'Time',
      width: '120px',
      render: (message: ChatMessage) => (
        <span className="text-sm text-gray-600">
          {new Date(message.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (message: ChatMessage) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handlePinMessage(message.id)}
          >
            <PinIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteMessage(message.id)}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: 'rooms', label: 'Chat Rooms', icon: <MessageSquareIcon className="w-4 h-4" /> },
    { id: 'flagged', label: 'Flagged Messages', icon: <FlagIcon className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3Icon className="w-4 h-4" /> },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Chat Management
            </h1>
            <p className="text-gray-600">
              Manage chat rooms, moderate messages, and view analytics
            </p>
          </div>
          <Button variant="primary" onClick={handleCreateRoom} disabled={loading}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-african-green/10 rounded-xl flex items-center justify-center">
                <MessageSquareIcon className="w-6 h-6 text-african-green" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Rooms</p>
                <p className="text-2xl font-display font-bold text-gray-900">{rooms.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-african-blue/10 rounded-xl flex items-center justify-center">
                <BarChart3Icon className="w-6 h-6 text-african-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-display font-bold text-gray-900">{totalMessages}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-african-red/10 rounded-xl flex items-center justify-center">
                <FlagIcon className="w-6 h-6 text-african-red" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Flagged Messages</p>
                <p className="text-2xl font-display font-bold text-gray-900">
                  {flaggedMessages.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <Tabs tabs={tabs} defaultTab="rooms" onChange={setActiveTab}>
            {(tab) => (
              <>
                {tab === 'rooms' && (
                  <Table data={rooms} columns={roomColumns} />
                )}

                {tab === 'flagged' && (
                  <>
                    {flaggedMessages.length === 0 ? (
                      <div className="text-center py-12">
                        <FlagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No flagged messages</p>
                      </div>
                    ) : (
                      <Table data={flaggedMessages} columns={flaggedColumns} />
                    )}
                  </>
                )}

                {tab === 'analytics' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-display font-bold text-gray-900">
                        Room Activity
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadRoomActivity}
                        disabled={loadingActivity}
                      >
                        {loadingActivity ? 'Loading...' : 'Refresh'}
                      </Button>
                    </div>
                    {loadingActivity && Object.keys(roomActivity).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Loading room activity...</p>
                      </div>
                    ) : rooms.length === 0 ? (
                      <p className="text-gray-600">No chat rooms available.</p>
                    ) : (
                      <div className="space-y-4">
                        {rooms.map((room) => {
                          const activity = roomActivity[room.id] || {
                            messageCount: 0,
                            activeUsers: 0,
                            recentMessages: [],
                            lastActivity: null,
                          };
                          return (
                            <Card key={room.id} className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{room.name}</h4>
                                  <p className="text-sm text-gray-600">{room.description}</p>
                                </div>
                                <Badge variant="info">
                                  <UsersIcon className="w-3 h-3 mr-1" />
                                  {activity.activeUsers} active
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                <div>
                                  <p className="font-medium text-gray-900">Total Messages</p>
                                  <p>{activity.messageCount}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Type</p>
                                  <p className="capitalize">{room.type}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Moderators</p>
                                  <p>{room.moderators.length}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Pinned Messages</p>
                                  <p>{room.pinnedMessages.length}</p>
                                </div>
                              </div>
                              {activity.lastActivity && (
                                <div className="text-xs text-gray-500 pt-3 border-t border-gray-100">
                                  Last activity: {new Date(activity.lastActivity).toLocaleString()}
                                </div>
                              )}
                              {activity.recentMessages.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <p className="text-xs font-medium text-gray-700 mb-2">Recent Messages:</p>
                                  <div className="space-y-1">
                                    {activity.recentMessages.slice(0, 3).map((msg: any) => (
                                      <p key={msg.id} className="text-xs text-gray-600 truncate">
                                        <span className="font-medium">{msg.userName}:</span> {msg.content.substring(0, 50)}...
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </Tabs>
        </Card>
      </div>

      <ChatRoomForm
        isOpen={showRoomForm}
        onClose={() => setShowRoomForm(false)}
        onSubmit={handleSubmitRoom}
        room={selectedRoom}
      />
    </AdminLayout>
  );
}
