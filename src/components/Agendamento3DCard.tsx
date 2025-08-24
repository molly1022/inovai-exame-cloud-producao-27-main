
import { Users, Calendar, Clock, User, FileText, ChevronDown } from "lucide-react";
import { use3DRotation } from "@/hooks/use3DRotation";

/**
 * Card 3D Interativo com informações simuladas de agendamento.
 */
const Agendamento3DCard = () => {
  const { rotateY, eventHandlers } = use3DRotation();

  return (
    <div
      {...eventHandlers}
      className="relative mx-auto my-6 w-full max-w-[390px] sm:max-w-2xl rounded-3xl shadow-2xl border-2 border-blue-700/20 bg-gradient-to-br from-blue-950 via-[#18132b] to-purple-950/70 p-4 sm:p-8 animate-fade-in transition-transform duration-200 select-none"
      style={{
        transform: `perspective(900px) rotateY(${rotateY}deg) rotateX(5deg)`,
        boxShadow: "0 8px 40px 0 rgba(80,50,180,0.17)",
        overflow: "hidden",
      }}
      tabIndex={0}
      aria-label="Novo Agendamento (Simulação 3D interativa)"
    >
      <div className="mb-3 text-xl sm:text-2xl font-bold text-center text-transparent bg-gradient-to-r from-blue-400 via-purple-300 to-blue-300 bg-clip-text drop-shadow-lg">
        Novo Agendamento
      </div>
      <div className="mb-4 sm:mb-5 text-center text-xs sm:text-sm text-gray-300">Interaja arrastando o card para girar (informações fictícias)</div>
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Paciente */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-200 mb-1">Paciente *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <Users size={18} />
            </span>
            <input
              disabled
              value="Maria Oliveira"
              className="pl-10 pr-8 py-2 w-full rounded-lg border outline-none bg-[#181827] border-[#37338b]/60 text-gray-300 placeholder-gray-400 cursor-not-allowed opacity-85"
            />
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>
        {/* Médico */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-200 mb-1">Médico</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-300">
              <User size={18} />
            </span>
            <input
              disabled
              value="Dr. João Silva"
              className="pl-10 pr-8 py-2 w-full rounded-lg border outline-none bg-[#181827] border-[#37338b]/60 text-gray-300 placeholder-gray-400 cursor-not-allowed opacity-85"
            />
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>
        {/* Categoria de Exame */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-200 mb-1">Categoria do Exame</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400">
              <FileText size={18} />
            </span>
            <input
              disabled
              value="Imagem"
              className="pl-10 pr-8 py-2 w-full rounded-lg border outline-none bg-[#181827] border-[#37338b]/60 text-gray-300 placeholder-gray-400 cursor-not-allowed"
            />
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>
        {/* Tipo de Exame */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-200 mb-1">Tipo de Exame *</label>
          <input
            disabled
            value="Ressonância"
            className="py-2 px-4 w-full rounded-lg border outline-none bg-[#181827] border-[#37338b]/60 text-gray-300 placeholder-gray-400 cursor-not-allowed"
          />
        </div>
        {/* Data do Agendamento */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-200 mb-1">Data do Agendamento *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300">
              <Calendar size={17} />
            </span>
            <input
              disabled
              value="21/06/2025"
              className="pl-10 pr-2 py-2 w-full rounded-lg border outline-none bg-[#181827] border-[#37338b]/60 text-gray-300 cursor-not-allowed"
            />
          </div>
        </div>
        {/* Horário */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-200 mb-1">Horário</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-300">
              <Clock size={18} />
            </span>
            <input
              disabled
              value="09:30"
              className="pl-10 pr-8 py-2 w-full rounded-lg border outline-none bg-[#181827] border-[#37338b]/60 text-gray-300 placeholder-gray-400 cursor-not-allowed"
            />
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>
        {/* Status */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-200 mb-1">Status</label>
          <input
            disabled
            value="Agendado"
            className="py-2 px-4 w-full rounded-lg border outline-none bg-[#181827] border-[#37338b]/60 text-gray-300 cursor-not-allowed"
          />
        </div>
        {/* Observações (campo ocupa duas colunas) */}
        <div className="sm:col-span-2">
          <label className="block text-xs sm:text-sm text-gray-200 mb-1">Observações</label>
          <textarea
            disabled
            value="Paciente prefere ser contato por WhatsApp. Trazer exames anteriores."
            className="py-2 px-4 w-full rounded-lg border outline-none min-h-[44px] sm:min-h-[48px] bg-[#181827] border-[#37338b]/60 text-gray-300 placeholder-gray-400 cursor-not-allowed resize-none"
          />
        </div>
      </form>
    </div>
  );
};

export default Agendamento3DCard;
