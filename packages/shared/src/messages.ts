// Message utilities
export interface MessageContent {
  content: string;
  type: string;
}

export function getMessageContentString(message: any): string {
  if (typeof message === 'string') {
    return message;
  }
  
  if (message?.content) {
    if (typeof message.content === 'string') {
      return message.content;
    }
    
    if (Array.isArray(message.content)) {
      return message.content
        .map((item: any) => typeof item === 'string' ? item : item.text || item.content || '')
        .join(' ');
    }
  }
  
  return '';
}