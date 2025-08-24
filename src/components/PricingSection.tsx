
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      price: "R$ 299",
      period: "/mês",
      description: "Ideal para clínicas pequenas",
      features: [
        "Até 1.000 pacientes",
        "Agendamento básico",
        "Relatórios essenciais",
        "Suporte por email",
        "Backup diário"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "R$ 599",
      period: "/mês",
      description: "Para clínicas em crescimento",
      features: [
        "Até 5.000 pacientes",
        "Agendamento avançado",
        "Relatórios completos",
        "Suporte prioritário",
        "Backup em tempo real",
        "Integração WhatsApp",
        "Portal do paciente"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "R$ 999",
      period: "/mês",
      description: "Para grandes clínicas e redes",
      features: [
        "Pacientes ilimitados",
        "Todas as funcionalidades",
        "Relatórios personalizados",
        "Suporte 24/7",
        "Backup redundante",
        "API personalizada",
        "Treinamento incluído",
        "Consultoria especializada"
      ],
      popular: false
    }
  ];

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold text-white mb-4">
          Planos que Cabem no seu Orçamento
        </h3>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Escolha o plano ideal para o tamanho da sua clínica. Todos incluem suporte e atualizações.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <Card 
            key={plan.name} 
            className={`relative bg-slate-800/80 border transition-all duration-300 hover:scale-105 ${
              plan.popular 
                ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>Mais Popular</span>
                </div>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-white text-2xl mb-2">{plan.name}</CardTitle>
              <div className="mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400">{plan.period}</span>
              </div>
              <p className="text-slate-400">{plan.description}</p>
            </CardHeader>
            
            <CardContent className="pt-0">
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {plan.popular ? 'Começar Agora' : 'Escolher Plano'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <p className="text-slate-400 mb-4">
          Todos os planos incluem teste gratuito de 30 dias
        </p>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
          Ver Comparação Completa
        </Button>
      </div>
    </section>
  );
};

export default PricingSection;
