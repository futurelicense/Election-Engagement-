import React from 'react';
import { Table } from '../ui/Table';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Comment } from '../../utils/types';
import { formatDistanceToNow } from 'date-fns';
import { CheckIcon, XIcon, EyeOffIcon } from 'lucide-react';
interface CommentModerationTableProps {
  comments: Comment[];
  onApprove: (commentId: string) => void;
  onHide: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}
export function CommentModerationTable({
  comments,
  onApprove,
  onHide,
  onDelete
}: CommentModerationTableProps) {
  const columns = [{
    key: 'userName',
    header: 'User',
    width: '150px'
  }, {
    key: 'content',
    header: 'Comment',
    render: (comment: Comment) => <div className="max-w-md">
          <p className="line-clamp-2 text-sm">{comment.content}</p>
        </div>
  }, {
    key: 'timestamp',
    header: 'Posted',
    width: '120px',
    render: (comment: Comment) => <span className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(comment.timestamp), {
        addSuffix: true
      })}
        </span>
  }, {
    key: 'status',
    header: 'Status',
    width: '120px',
    render: (comment: Comment) => <div className="flex gap-2">
          {comment.flagged && <Badge variant="danger">Flagged</Badge>}
          {comment.approved ? <Badge variant="success">Approved</Badge> : <Badge variant="warning">Pending</Badge>}
        </div>
  }, {
    key: 'actions',
    header: 'Actions',
    width: '200px',
    render: (comment: Comment) => <div className="flex gap-2">
          {!comment.approved && <Button size="sm" variant="primary" onClick={() => onApprove(comment.id)}>
              <CheckIcon className="w-4 h-4" />
            </Button>}
          <Button size="sm" variant="secondary" onClick={() => onHide(comment.id)}>
            <EyeOffIcon className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(comment.id)}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
  }];
  return <Table data={comments} columns={columns} />;
}