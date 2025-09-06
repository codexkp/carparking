'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Bot, User, CornerDownLeft, Loader2 } from 'lucide-react';
import { askBookingAssistant } from '@/ai/flows/ai-powered-booking-assistant';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const { answer } = await askBookingAssistant({ query: currentInput });
      const assistantMessage: Message = { role: 'assistant', content: answer };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
            aria-label="Open AI Booking Assistant"
          >
            <Bot className="h-8 w-8" />
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>AI Booking Assistant</SheetTitle>
            <SheetDescription>
              Your personal parking concierge. Ask me anything!
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-grow my-4 -mx-6" viewportRef={scrollAreaRef}>
            <div className="space-y-4 px-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn('flex items-start gap-3', {
                    'justify-end': message.role === 'user',
                  })}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <Bot className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'rounded-lg p-3 max-w-xs lg:max-w-sm shadow-sm',
                      {
                        'bg-primary text-primary-foreground':
                          message.role === 'user',
                        'bg-secondary': message.role === 'assistant',
                      }
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-secondary shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <SheetFooter>
            <form
              onSubmit={handleSendMessage}
              className="flex w-full items-center space-x-2"
            >
              <Input
                type="text"
                placeholder="Ask about parking rules..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <CornerDownLeft className="h-4 w-4" />
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
