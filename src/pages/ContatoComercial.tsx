import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, Mail, MessageCircle, Building2, Clock, CheckCircle } from 'lucide-react';

const ContatoComercial = () => {
  const navigate = useNavigate();

  const openWhatsApp = () => {
    window.open('https://wa.me/5511999999999?text=Olá! Gostaria de conhecer o Inovai ProMed e solicitar uma demonstração para minha clínica.', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold text-sm">
                INOVAI
              </div>
              <span className="font-semibold text-lg">ProMed</span>
            </div>
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Building2 className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Transforme sua Clínica com{' '}
              <span className="text-primary">Inovai ProMed</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Entre em contato com nossa equipe comercial para conhecer como o Inovai ProMed pode revolucionar a gestão da sua clínica médica.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Demonstração Gratuita</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Agende uma demonstração personalizada de 30 minutos sem compromisso
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Consultoria Especializada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nossa equipe vai entender suas necessidades e propor a melhor solução
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Implementação Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Suporte completo na migração e treinamento da sua equipe
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* WhatsApp */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={openWhatsApp}>
              <CardHeader className="text-center">
                <MessageCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-green-600">WhatsApp</CardTitle>
                <CardDescription>Fale conosco agora mesmo</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bg-green-500 hover:bg-green-600" onClick={openWhatsApp}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Conversar no WhatsApp
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Resposta em minutos
                </p>
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardHeader className="text-center">
                <Mail className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <CardTitle className="text-blue-600">Email</CardTitle>
                <CardDescription>Envie sua solicitação detalhada</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => window.location.href = 'mailto:comercial@inovaipromed.com?subject=Solicitar Demonstração Inovai ProMed'}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  comercial@inovaipromed.com
                </p>
              </CardContent>
            </Card>
          </div>

          {/* What to Expect */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
              <CardTitle className="text-center">O que esperar da nossa demonstração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Análise das suas necessidades</h4>
                      <p className="text-sm text-muted-foreground">
                        Entendemos os desafios específicos da sua clínica
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Demonstração personalizada</h4>
                      <p className="text-sm text-muted-foreground">
                        Mostramos como o sistema se adapta ao seu fluxo de trabalho
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Proposta comercial</h4>
                      <p className="text-sm text-muted-foreground">
                        Apresentamos a melhor opção de plano para sua clínica
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Suporte à migração</h4>
                      <p className="text-sm text-muted-foreground">
                        Orientações para migrar seus dados do sistema atual
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Treinamento incluído</h4>
                      <p className="text-sm text-muted-foreground">
                        Capacitação completa para sua equipe usar o sistema
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Suporte contínuo</h4>
                      <p className="text-sm text-muted-foreground">
                        Acompanhamento e suporte técnico especializado
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Final */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Pronto para revolucionar sua clínica?
            </h2>
            <p className="text-slate-600 mb-6">
              Entre em contato agora e descubra como milhares de profissionais da saúde estão otimizando suas práticas com Inovai ProMed.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-4 text-lg" onClick={openWhatsApp}>
              <MessageCircle className="mr-2 h-5 w-5" />
              Falar com Especialista
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContatoComercial;