import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { ChatRoom, ChatRoomType } from '../../utils/types';
interface ChatRoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (room: Partial<ChatRoom>) => void;
  room?: ChatRoom;
}
export function ChatRoomForm({
  isOpen,
  onClose,
  onSubmit,
  room
}: ChatRoomFormProps) {
  const [formData, setFormData] = useState({
    name: room?.name || '',
    description: room?.description || '',
    type: room?.type || 'country' as ChatRoomType,
    entityId: room?.entityId || '',
    moderators: room?.moderators?.join(', ') || '',
    enabled: true
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const moderatorsList = formData.moderators.split(',').map(m => m.trim()).filter(Boolean);
    onSubmit({
      id: room?.id,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      entityId: formData.entityId || `custom_${Date.now()}`,
      moderators: moderatorsList,
      pinnedMessages: room?.pinnedMessages || [],
      createdAt: room?.createdAt || new Date().toISOString(),
      activeUsers: room?.activeUsers || 0
    });
    onClose();
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={room ? 'Edit Chat Room' : 'Create Chat Room'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Room Name" value={formData.name} onChange={e => setFormData({
        ...formData,
        name: e.target.value
      })} placeholder="e.g., General Discussion" required />

        <Textarea label="Description" value={formData.description} onChange={e => setFormData({
        ...formData,
        description: e.target.value
      })} placeholder="Brief description of this chat room..." rows={3} required />

        <Select label="Room Type" value={formData.type} onChange={e => setFormData({
        ...formData,
        type: e.target.value as ChatRoomType
      })} options={[{
        value: 'country',
        label: 'Country'
      }, {
        value: 'election',
        label: 'Election'
      }, {
        value: 'candidate',
        label: 'Candidate'
      }]} />

        <Input label="Entity ID" value={formData.entityId} onChange={e => setFormData({
        ...formData,
        entityId: e.target.value
      })} placeholder="Associated country/election/candidate ID" helperText="Leave empty for custom rooms" />

        <Input label="Moderators (comma-separated user IDs)" value={formData.moderators} onChange={e => setFormData({
        ...formData,
        moderators: e.target.value
      })} placeholder="user1, user2, user3" />

        <Checkbox label="Enable this room" checked={formData.enabled} onChange={e => setFormData({
        ...formData,
        enabled: e.target.checked
      })} />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {room ? 'Update Room' : 'Create Room'}
          </Button>
        </div>
      </form>
    </Modal>;
}