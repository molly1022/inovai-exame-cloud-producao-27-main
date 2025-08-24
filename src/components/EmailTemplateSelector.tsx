import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, Mail, Star, Zap } from 'lucide-react';
import TemplatePreviewModal from './TemplatePreviewModal';

interface EmailTemplateSelectorProps {
  templatePersonalizado: string;
  onTemplateChange: (template: string) => void;
}

const getTemplates = () => ({
  simples: {
    nome: 'Simples',
    descricao: 'Email básico com informações essenciais',
    icon: <Mail className="h-5 w-5" />,
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f5f5f5; }
      .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
      .header { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #e0e0e0; }
      .content { margin: 20px 0; }
      .info { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #007bff; }
      .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="color: #007bff; margin: 0;">{clinica_nome}</h1>
        <p style="margin: 5px 0; color: #666;">Lembrete de Consulta</p>
      </div>
      
      <div class="content">
        <p>Olá, <strong>{paciente_nome}</strong>!</p>
        <p>Você tem uma consulta agendada para amanhã:</p>
        
        <div class="info">
          <p><strong>📅 Data:</strong> {data_agendamento}</p>
          <p><strong>⏰ Horário:</strong> {horario}</p>
          <p><strong>🔬 Exame:</strong> {tipo_exame}</p>
          <p><strong>👨‍⚕️ Médico:</strong> {medico_nome}</p>
        </div>
        
        <p>📍 <strong>Chegue 15 minutos antes do horário agendado.</strong></p>
        <p>📄 Traga seus documentos e carteirinha do convênio.</p>
      </div>
      
      <div class="footer">
        <p>{clinica_nome}</p>
        <p>Este é um lembrete automático.</p>
      </div>
    </div>
  </body>
</html>`
  },
  completo: {
    nome: 'Completo',
    descricao: 'Email com todas as informações importantes',
    icon: <Star className="h-5 w-5" />,
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f0f2f5; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .header { background: #007bff; color: white; padding: 25px; text-align: center; }
      .content { padding: 30px; }
      .info-box { background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; margin: 20px 0; border-radius: 8px; }
      .info-box h3 { margin-top: 0; color: #495057; }
      .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
      .info-row:last-child { border-bottom: none; }
      .warning-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f39c12; }
      .contact-box { background: #e3f2fd; border: 1px solid #90caf9; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="margin: 0;">{clinica_nome}</h1>
        <p style="margin: 5px 0; opacity: 0.9;">Lembrete de Consulta Médica</p>
      </div>
      
      <div class="content">
        <h2 style="color: #007bff;">Olá, {paciente_nome}!</h2>
        <p>Este é um lembrete sobre sua consulta que está se aproximando. Confira todos os detalhes:</p>
        
        <div class="info-box">
          <h3>📅 Informações da Consulta</h3>
          <div class="info-row">
            <span><strong>Data:</strong></span>
            <span>{data_agendamento}</span>
          </div>
          <div class="info-row">
            <span><strong>Horário:</strong></span>
            <span>{horario}</span>
          </div>
          <div class="info-row">
            <span><strong>Tipo de Exame:</strong></span>
            <span>{tipo_exame}</span>
          </div>
          <div class="info-row">
            <span><strong>Médico:</strong></span>
            <span>{medico_nome}</span>
          </div>
          <div class="info-row">
            <span><strong>CRM:</strong></span>
            <span>{medico_crm}</span>
          </div>
          <div class="info-row">
            <span><strong>Convênio:</strong></span>
            <span>{convenio_nome}</span>
          </div>
        </div>

        {pagamento_info}

        <div class="warning-box">
          <h3>⚠️ Orientações Importantes</h3>
          <p><strong>🕐 Chegada:</strong> 15 minutos de antecedência</p>
          <p><strong>📄 Documentos:</strong> RG, CPF e carteirinha do convênio</p>
          <p><strong>⏰ Tolerância:</strong> Máximo 15 minutos de atraso</p>
          <p><strong>🚫 Atenção:</strong> Após 15 min de atraso, será marcado como falta</p>
        </div>

        <div class="contact-box">
          <h3>📞 Contato da Clínica</h3>
          <p><strong>{clinica_nome}</strong></p>
          <p>📍 {clinica_endereco}</p>
          <p>📞 {clinica_telefone}</p>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>{clinica_nome}</strong></p>
        <p>Email automático enviado em {data_envio}</p>
      </div>
    </div>
  </body>
</html>`
  },
  premium: {
    nome: 'Premium',
    descricao: 'Email elegante e profissional com design moderno',
    icon: <Zap className="h-5 w-5" />,
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      .container { max-width: 650px; margin: 20px auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; position: relative; }
      .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><circle cx="20" cy="10" r="3" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="10" r="4" fill="white" opacity="0.1"/></svg>') repeat; }
      .logo { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; text-shadow: 0 3px 6px rgba(0,0,0,0.3); position: relative; z-index: 1; }
      .subtitle { font-size: 1.2em; opacity: 0.9; position: relative; z-index: 1; }
      .content { padding: 40px 35px; }
      .greeting { font-size: 1.4em; margin-bottom: 25px; color: #2c3e50; }
      .highlight { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 4px 12px; border-radius: 20px; font-weight: 600; }
      .info-card { background: linear-gradient(135deg, #f8f9fc, #fff); border: 1px solid #e8ecf3; border-left: 5px solid #667eea; padding: 25px; margin: 25px 0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
      .info-card h3 { margin-top: 0; color: #2c3e50; font-size: 1.2em; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
      .info-item { background: white; padding: 12px; border-radius: 8px; border: 1px solid #f0f0f0; }
      .info-label { font-size: 0.9em; color: #666; margin-bottom: 4px; }
      .info-value { font-weight: 600; color: #2c3e50; }
      .warning-card { background: linear-gradient(135deg, #fff8e1, #fffbf0); border: 1px solid #ffcc02; border-left: 5px solid #ff9800; padding: 25px; margin: 25px 0; border-radius: 12px; }
      .payment-card { background: linear-gradient(135deg, #e8f5e8, #f0fff0); border: 1px solid #4caf50; border-left: 5px solid #4caf50; padding: 25px; margin: 25px 0; border-radius: 12px; }
      .payment-pending { background: linear-gradient(135deg, #ffebee, #fff5f5); border: 1px solid #f44336; border-left: 5px solid #f44336; }
      .contact-section { background: linear-gradient(135deg, #e3f2fd, #f3e5f5); border: 1px solid #2196f3; padding: 25px; margin: 25px 0; border-radius: 12px; text-align: center; }
      .footer { background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 30px; text-align: center; }
      .footer p { margin: 8px 0; }
      .money { font-weight: bold; color: #4caf50; }
      .pending-money { font-weight: bold; color: #f44336; }
      @media (max-width: 600px) {
        .container { margin: 10px; border-radius: 10px; }
        .content { padding: 25px 20px; }
        .info-grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">🏥 {clinica_nome}</div>
        <div class="subtitle">Lembrete de Consulta Médica</div>
      </div>
      
      <div class="content">
        <div class="greeting">Olá, <span class="highlight">{paciente_nome}</span>!</div>
        <p style="font-size: 1.1em; margin-bottom: 30px; color: #555;">Este é um lembrete sobre sua consulta que está se aproximando. Confira todos os detalhes importantes:</p>
        
        <div class="info-card">
          <h3>📅 Informações da Consulta</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Data</div>
              <div class="info-value">{data_agendamento}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Horário</div>
              <div class="info-value">{horario}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tipo de Exame</div>
              <div class="info-value">{tipo_exame}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Médico</div>
              <div class="info-value">{medico_nome}</div>
            </div>
            <div class="info-item">
              <div class="info-label">CRM</div>
              <div class="info-value">{medico_crm}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Convênio</div>
              <div class="info-value">{convenio_nome}</div>
            </div>
          </div>
        </div>

        {pagamento_info}

        <div class="warning-card">
          <h3>⚠️ Orientações Importantes</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
            <div>
              <p><strong>🕐 Chegada:</strong><br>15 minutos de antecedência</p>
            </div>
            <div>
              <p><strong>📄 Documentos:</strong><br>RG, CPF e carteirinha</p>
            </div>
            <div>
              <p><strong>⏰ Tolerância:</strong><br>Máximo 15 minutos</p>
            </div>
            <div>
              <p><strong>🚫 Importante:</strong><br>Após atraso = falta</p>
            </div>
          </div>
        </div>

        <div class="contact-section">
          <h3>📞 Informações de Contato</h3>
          <div style="margin: 20px 0;">
            <p style="font-size: 1.3em; font-weight: bold; margin: 10px 0; color: #2c3e50;">{clinica_nome}</p>
            <p style="margin: 8px 0;">📍 {clinica_endereco}</p>
            <p style="margin: 8px 0;">📞 {clinica_telefone}</p>
            <p style="margin: 8px 0;">✉️ {clinica_email}</p>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <p style="margin: 0; font-style: italic; color: #666;">
            💡 <strong>Dica:</strong> Salve este email para consultar as informações no dia da consulta
          </p>
        </div>
      </div>
      
      <div class="footer">
        <p style="font-size: 1.1em; font-weight: bold;">{clinica_nome}</p>
        <p>Cuidando da sua saúde com dedicação e profissionalismo</p>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 11px; opacity: 0.8;">
          <p>Este é um lembrete automático. Não responda a este email.</p>
          <p>Email enviado em {data_envio}</p>
        </div>
      </div>
    </div>
  </body>
</html>`
  }
});

const EmailTemplateSelector = ({ templatePersonalizado, onTemplateChange }: EmailTemplateSelectorProps) => {
  const templates = getTemplates();
  
  const getCurrentTemplate = () => {
    if (!templatePersonalizado || templatePersonalizado.trim() === '') return 'simples';
    
    for (const [key, template] of Object.entries(templates)) {
      if (templatePersonalizado.trim() === template.html.trim()) {
        return key as 'simples' | 'completo' | 'premium';
      }
    }
    return 'personalizado';
  };

  const [templateSelecionado, setTemplateSelecionado] = useState<'simples' | 'completo' | 'premium' | 'personalizado'>(getCurrentTemplate());
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; templateName: string; templateHtml: string }>({
    isOpen: false,
    templateName: '',
    templateHtml: ''
  });

  const handleTemplateSelect = (tipo: 'simples' | 'completo' | 'premium') => {
    setTemplateSelecionado(tipo);
    const template = templates[tipo];
    if (template && template.html) {
      onTemplateChange(template.html);
    }
  };

  const handlePreview = (templateKey: string, templateName: string, templateHtml: string) => {
    setPreviewModal({
      isOpen: true,
      templateName,
      templateHtml: templateHtml || '<p>Template não disponível</p>'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold">Escolher Template de Email</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione o estilo de email que será enviado aos pacientes
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm font-medium text-blue-700">
            Template Ativo: {
              templateSelecionado === 'personalizado' 
                ? 'Personalizado' 
                : templates[templateSelecionado]?.nome || 'Simples'
            }
          </p>
        </div>
        <p className="text-xs text-blue-600">
          Este template será usado para todos os lembretes automáticos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(templates).map(([key, template]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
              templateSelecionado === key 
                ? 'ring-2 ring-blue-500 bg-blue-50/50 shadow-lg' 
                : 'hover:border-blue-300'
            }`}
            onClick={() => handleTemplateSelect(key as any)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {template.icon}
                  <CardTitle className="text-base">{template.nome}</CardTitle>
                </div>
                {templateSelecionado === key && (
                  <Badge variant="default" className="bg-blue-500">
                    Ativo
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                {template.descricao}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(key, template.nome, template.html);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Preview
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-medium text-amber-800 mb-2">💡 Informações sobre Templates</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li><strong>Simples:</strong> Ideal para envios básicos, design clean</li>
          <li><strong>Completo:</strong> Inclui todas as informações importantes</li>
          <li><strong>Premium:</strong> Design moderno e profissional, totalmente responsivo</li>
        </ul>
      </div>

      <TemplatePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, templateName: '', templateHtml: '' })}
        templateName={previewModal.templateName}
        templateHtml={previewModal.templateHtml}
      />
    </div>
  );
};

export default EmailTemplateSelector;