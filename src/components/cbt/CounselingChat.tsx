import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TypewriterText } from './TypewriterText';
import { cn } from '@/lib/utils';
import { EmotionType, EMOTIONS } from '@/types/cbt';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isNew?: boolean; // 标记是否为新消息，用于打字机效果
}

interface CounselingChatProps {
  selectedEmotion: EmotionType | null;
  automaticThought: string;
  detectedDistortions: string[];
}

export function CounselingChat({
  selectedEmotion,
  automaticThought,
  detectedDistortions,
}: CounselingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 当打开聊天窗口时，AI 主动发送第一条消息
  const initializeChat = useCallback(async () => {
    if (hasInitialized) return;
    
    setHasInitialized(true);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('counseling-chat', {
        body: {
          messages: [],
          emotion: selectedEmotion,
          automaticThought,
          distortions: detectedDistortions,
          isInitial: true,
        },
      });

      if (error) throw error;

      if (data?.message) {
        setMessages([{
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message,
          isNew: true,
        }]);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      // 使用默认问候语
      const emotionLabel = selectedEmotion 
        ? EMOTIONS.find(e => e.id === selectedEmotion)?.label || '情绪困扰'
        : '一些情绪';
      
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: `我注意到你正在经历${emotionLabel}。我在这里陪伴你，愿意和我聊聊现在的感受吗？🌱`,
        isNew: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [hasInitialized, isOpen, selectedEmotion, automaticThought, detectedDistortions]);

  useEffect(() => {
    if (isOpen && !hasInitialized) {
      initializeChat();
    }
    // 打开聊天窗口时清除未读计数
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen, hasInitialized, initializeChat]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('counseling-chat', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          emotion: selectedEmotion,
          automaticThought,
          distortions: detectedDistortions,
          isInitial: false,
        },
      });

      if (error) throw error;

      if (data?.message) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          isNew: true,
        }]);
        // 如果聊天窗口关闭，增加未读计数
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我暂时无法回应。请稍后再试，或者继续完成认知重构练习。💙',
        isNew: true,
      }]);
      // 如果聊天窗口关闭，增加未读计数
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* 浮动聊天按钮 */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-lavender hover:bg-lavender/90 text-white shadow-lg flex items-center justify-center transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
            {/* 未读消息计数徽章 */}
            {unreadCount > 0 ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-rose-500 rounded-full flex items-center justify-center text-xs font-medium text-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            ) : (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-sage rounded-full animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* 聊天窗口 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[340px] h-[480px] bg-card rounded-3xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 bg-lavender/10 border-b border-lavender/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-lavender/20 flex items-center justify-center">
                  <span className="text-lg">🌿</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">心灵伙伴</h3>
                  <p className="text-xs text-muted-foreground">在这里陪伴你</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-lavender/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                      message.role === 'user'
                        ? 'bg-lavender text-white rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    )}
                  >
                    {message.role === 'assistant' && message.isNew ? (
                      <TypewriterText
                        text={message.content}
                        speed={30}
                        onComplete={() => {
                          // 打字完成后标记为非新消息
                          setMessages(prev => prev.map(m => 
                            m.id === message.id ? { ...m, isNew: false } : m
                          ));
                        }}
                      />
                    ) : (
                      message.content
                    )}
                  </div>
                </motion.div>
              ))}
              
              {/* 加载指示器 */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-lavender/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-lavender/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-lavender/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="p-3 border-t border-border/50 bg-background/50">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="分享你的想法..."
                  rows={1}
                  className="flex-1 resize-none rounded-2xl border border-lavender/30 bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-lavender transition-colors"
                  style={{ maxHeight: '80px' }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="h-10 w-10 rounded-full bg-lavender hover:bg-lavender/90 disabled:opacity-50 shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
