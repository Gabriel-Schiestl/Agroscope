'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLimit } from '@/hooks/use-limit';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Leaf, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { History } from '@/models/History';
import api from '../../shared/http/http.config';
import { cropLabel, sicknessLabel } from '@/lib/agro-labels';

interface ChatMessageDto {
  id: string;
  content: string;
  sender: 'human' | 'ai';
  userId: string;
  sessionId: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  open: boolean;
  analysis: History | null;
  onClose: () => void;
}

function dtoToMessage(dto: ChatMessageDto): ChatMessage {
  return {
    id: dto.id,
    role: dto.sender === 'human' ? 'user' : 'assistant',
    content: dto.content,
    timestamp: new Date(dto.createdAt),
  };
}

function buildInitialMessage(analysis: History | null): ChatMessage {
  const cropPT = cropLabel(analysis?.crop);
  const confidence = analysis?.sicknessConfidence
    ? ` (${(analysis.sicknessConfidence * 100).toFixed(1)}% de confiança)`
    : '';

  const isHealthy = !analysis?.sicknessId;

  const content = isHealthy
    ? `Olá! Sou seu assistente agrícola. A planta ${cropPT} está saudável — nenhuma doença detectada.\n\nPosso ajudá-lo com dúvidas gerais sobre manejo preventivo ou outras questões. O que gostaria de saber?`
    : `Olá! Sou seu assistente agrícola. Identifiquei ${sicknessLabel(analysis.sicknessName)}${confidence} em ${cropPT}.\n\nPosso ajudá-lo com dúvidas sobre:\n• Manejo e controle da doença\n• Causas e condições favoráveis\n• Produtos e aplicações\n• Prevenção futura\n\nO que gostaria de saber?`;

  return {
    id: 'init',
    role: 'assistant',
    content,
    timestamp: new Date(),
  };
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-2 items-end',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primaryGreen/15 flex items-center justify-center">
          <Leaf className="h-3.5 w-3.5 text-primaryGreen" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-primaryGreen text-white rounded-br-sm'
            : 'bg-muted border rounded-bl-sm'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            'text-[10px] mt-1 text-right',
            isUser ? 'text-white/60' : 'text-muted-foreground'
          )}
        >
          {format(message.timestamp, 'HH:mm')}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-end">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primaryGreen/15 flex items-center justify-center">
        <Leaf className="h-3.5 w-3.5 text-primaryGreen" />
      </div>
      <div className="bg-muted border rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({ open, analysis, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);
  const { limit, refetch: refetchLimit } = useLimit();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const chatLimitReached =
    limit !== null && limit.chatRequests >= limit.chatLimit;

  // Connect socket and load history when panel opens
  useEffect(() => {
    if (!open || !analysis) return;

    setInputText('');
    setIsTyping(false);
    refetchLimit();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const socket: Socket = io(`${apiUrl}/chat`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Load history from REST, seed with greeting if empty
    api
      .get<ChatMessageDto[]>('/chat/history', {
        params: { sessionId: analysis.id },
      })
      .then((res) => {
        const history = res.data;
        if (history.length > 0) {
          setMessages(history.map(dtoToMessage));
        } else {
          setMessages([buildInitialMessage(analysis)]);
        }
      })
      .catch(() => {
        setMessages([buildInitialMessage(analysis)]);
      });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [open, analysis]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || isTyping || !socketRef.current || !analysis) return;
    if (chatLimitReached) return;

    setInputText('');
    setIsTyping(true);
    setLimitError(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const optimisticMsg: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    socketRef.current.emit(
      'send_message',
      { content: text, sessionId: analysis.id },
      (
        response:
          | { userMessage: ChatMessageDto; aiMessage: ChatMessageDto }
          | { error: string }
      ) => {
        if ('error' in response) {
          setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
          setLimitError(response.error);
          setIsTyping(false);
          refetchLimit();
          return;
        }
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticMsg.id),
          dtoToMessage(response.userMessage),
          dtoToMessage(response.aiMessage),
        ]);
        setIsTyping(false);
        refetchLimit();
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b space-y-0">
          <div className="flex items-center gap-3 pr-6">
            <div className="w-9 h-9 rounded-full bg-primaryGreen/15 flex items-center justify-center flex-shrink-0">
              <Leaf className="h-4 w-4 text-primaryGreen" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base leading-tight">
                Assistente AgroScope
              </SheetTitle>
              <SheetDescription className="text-xs mt-0.5 truncate">
                {analysis?.crop
                  ? `${cropLabel(analysis.crop)} · ${format(new Date(analysis.createdAt), 'dd/MM/yyyy', { locale: ptBR })}`
                  : 'Nova análise'}
              </SheetDescription>
            </div>
          </div>

          {/* Analysis context strip */}
          {analysis && (
            <div className="!mt-6 flex flex-wrap gap-1.5">
              {analysis.cropConfidence > 0 && (
                <Badge className="bg-primaryGreen text-xs">
                  {cropLabel(analysis.crop)} · {(analysis.cropConfidence * 100).toFixed(1)}%
                </Badge>
              )}
              {analysis.sicknessId && analysis.sicknessConfidence != null &&
                analysis.sicknessConfidence > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs text-primaryGreen border-primaryGreen/40"
                  >
                    {analysis.sicknessName
                      ? sicknessLabel(analysis.sicknessName)
                      : 'Doença'}{' '}
                    · {(analysis.sicknessConfidence * 100).toFixed(1)}%
                  </Badge>
                )}
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  isConnected
                    ? 'text-green-600 border-green-400/40'
                    : 'text-muted-foreground border-muted'
                )}
              >
                {isConnected ? '● Conectado' : '○ Conectando...'}
              </Badge>
            </div>
          )}
        </SheetHeader>

        {/* Messages */}
        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>

        <Separator />

        {/* Input */}
        <div className="px-4 py-3 flex flex-col gap-1.5">
          {limit && (
            <p
              className={cn(
                'text-xs text-right',
                chatLimitReached ? 'text-red-500' : 'text-muted-foreground'
              )}
            >
              Mensagens: {limit.chatRequests}/{limit.chatLimit}
            </p>
          )}
          {chatLimitReached && (
            <p className="text-xs text-red-500 text-center py-1">
              Limite de {limit?.chatLimit} mensagens atingido. Faça upgrade do
              seu plano para continuar conversando.
            </p>
          )}
          {!chatLimitReached && limitError && (
            <p className="text-xs text-red-500 text-center py-1">
              {limitError}
            </p>
          )}
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Escreva sua dúvida... (Enter para enviar)"
              disabled={isTyping || !isConnected || chatLimitReached}
              className="flex-1 resize-none rounded-xl border bg-muted/50 px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primaryGreen/40 disabled:opacity-50 min-h-[42px] max-h-[120px] overflow-y-auto leading-relaxed"
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={
                !inputText.trim() ||
                isTyping ||
                !isConnected ||
                chatLimitReached
              }
              className="bg-primaryGreen hover:bg-lightGreen h-[42px] w-[42px] flex-shrink-0 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
