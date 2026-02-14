import React, { useState, Component } from 'react';
import { Button } from './ui/Button';
import { SHARE_PLATFORMS } from '../utils/constants';
import { CheckIcon } from 'lucide-react';
interface ShareButtonProps {
  text: string;
  url: string;
}
export function ShareButton({
  text,
  url
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    const urls: Record<string, string> = {
      WhatsApp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      Twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
    };
    if (platform === 'Copy Link') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {SHARE_PLATFORMS.map(platform => <Button key={platform.name} onClick={() => handleShare(platform.name)} variant="secondary" className="flex flex-col items-center gap-2 h-auto py-4" style={{
      borderColor: platform.color,
      color: platform.color
    }}>
          <span className="text-3xl">{platform.icon}</span>
          <span className="text-sm font-medium">
            {platform.name === 'Copy Link' && copied ? <span className="flex items-center gap-1">
                <CheckIcon className="w-4 h-4" />
                Copied!
              </span> : platform.name}
          </span>
        </Button>)}
    </div>;
}