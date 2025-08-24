import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Stethoscope, Pill, FileText, Clock, Sparkles } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { secLog } from '@/utils/secureLogging';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  category?: string;
}

const AssistenteIA = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('geral');
  const { toast } = useToast();

  const categories = [
    { id: 'medicamentos', label: 'Medicamentos', icon: Pill, color: 'bg-blue-100 text-blue-800' },
    { id: 'diagnosticos', label: 'Diagnósticos', icon: Stethoscope, color: 'bg-green-100 text-green-800' },
    { id: 'procedimentos', label: 'Procedimentos', icon: FileText, color: 'bg-purple-100 text-purple-800' },
    { id: 'geral', label: 'Consulta Geral', icon: Bot, color: 'bg-gray-100 text-gray-800' }
  ];

  const exampleQuestions = [
    "Qual a posologia do paracetamol para adultos?",
    "Contraindicações da amoxicilina",
    "Sintomas de hipertensão arterial",
    "Como interpretar exame de hemograma completo?"
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      category: selectedCategory
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      secLog.info('Enviando consulta ao assistente IA', { category: selectedCategory });

      const { data, error } = await supabase.functions.invoke('ai-medical-assistant', {
        body: JSON.stringify({
          query: inputMessage,
          category: selectedCategory,
          context: 'medical_consultation'
        })
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response || 'Desculpe, não consegui processar sua consulta.',
        timestamp: new Date(),
        category: selectedCategory
      };

      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: "Consulta processada",
        description: "O assistente IA respondeu sua pergunta médica."
      });

    } catch (error: any) {
      secLog.error('Erro ao consultar assistente IA', { error: error.message });
      
      toast({
        title: "Erro",
        description: "Não foi possível consultar o assistente IA. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (question: string) => {
    setInputMessage(question);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-white min-h-screen p-6">
      {/* Header */}
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bot className="h-6 w-6" />
            </div>
            Assistente IA Médico
          </CardTitle>
          <CardDescription className="text-blue-100">
            Consulte informações médicas, medicamentos e procedimentos com inteligência artificial
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Categorias */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    className="w-full justify-start gap-2"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Exemplos de Perguntas */}
          <Card className="shadow-lg mt-6">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Exemplos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exampleQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-2 text-xs"
                  onClick={() => handleExampleClick(question)}
                >
                  {question}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="shadow-lg h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Chat Médico</CardTitle>
                  <CardDescription>
                    Categoria: 
                    <Badge className="ml-2">
                      {categories.find(c => c.id === selectedCategory)?.label}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {messages.length} mensagem(s)
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Bem-vindo ao Assistente IA Médico</p>
                  <p className="text-sm">Faça uma pergunta sobre medicamentos, diagnósticos ou procedimentos</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === 'assistant' && (
                          <Bot className="h-5 w-5 mt-0.5 text-blue-600" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs ${
                              message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                              {formatTimestamp(message.timestamp)}
                            </span>
                            {message.category && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                              >
                                {categories.find(c => c.id === message.category)?.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Digite sua pergunta médica..."
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                ⚠️ <strong>Aviso:</strong> As informações fornecidas são apenas para fins educacionais. 
                Sempre consulte um profissional de saúde qualificado para diagnósticos e tratamentos.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssistenteIA;