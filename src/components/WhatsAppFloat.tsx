
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppFloat = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "53999428130";
    const message = "Olá! Gostaria de conhecer mais sobre o Unovai Exame Cloud, sistema de gestão clínica especializado em exames e agendamentos. Podem me ajudar?";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <Button
        onClick={handleWhatsAppClick}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 shadow-2xl hover:scale-110 transition-all duration-300 group"
        size="lg"
      >
        <MessageCircle className="h-8 w-8 group-hover:animate-pulse" />
      </Button>
      
      {/* Tooltip */}
      <div className="absolute bottom-20 right-0 bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Fale conosco no WhatsApp
      </div>
    </div>
  );
};

export default WhatsAppFloat;
