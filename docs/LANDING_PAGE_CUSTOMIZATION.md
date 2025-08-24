# Documentação para Customização da Landing Page

## Inovai ProMed - Landing Page

Esta documentação explica como personalizar imagens e conteúdo da landing page baseada no design do Juvonno.

### 📁 Localização do Arquivo

A landing page está localizada em:
```
src/pages/JuvonnoLanding.tsx
```

### 🖼️ Imagens Principais

#### 1. Imagem Hero (Principal)
**Localização:** Linha 293-297
```javascript
<img 
  src="https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/6509a80759dbc530355af60c_Juvonno-LifestyleHero-Crop-V3.webp"
  alt="Interface do software de gestão clínica Inovai ProMed mostrando agenda diária com consultas, informações de pacientes, estatísticas e recursos de personalização."
  className="w-full h-auto rounded-lg shadow-2xl"
/>
```

#### 2. Logos das Clínicas (Slider)
**Localização:** Linhas 31-40
```javascript
const clinicLogos = [
  "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/638e1953bea4fe3c7af85203_JuvonnoClients-ReginaSpeech.png",
  "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/638e19533858f71d20e1fd89_JuvonnoClients-OttawaPhysio.png",
  // ... adicione mais logos aqui
];
```

#### 3. Imagens dos Recursos/Features
**Localização:** Linhas 42-146 (objeto `features`)

Cada feature tem uma imagem específica:

- **Agendamento:** `https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/64de27eeb22bbffa75ab208f_Scheduling-TeamWorkflow-GoogleCal.webp`
- **Faturamento:** `https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/650cabdae26d521193e91203_Billing-InsuranceWorkflows-Integrations.webp`
- **Prontuário & EMR:** `https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/6508b17438729c76c8d38786_EMR-PatientCharting.webp`
- **Agendamento Online:** `https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/64c975833aa6057080a48084_EMR-OnlineBooking.webp`
- **Comunicações:** `https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/650890c55e22b67a3863d15d_Disciplines-Communications.webp`
- **Relatórios:** `https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/64c9758402daeff4e87bde03_EMR-Reporting.webp`
- **Telemedicina:** `https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/647f8bd59ebe27afe2cb4a9b_Juvonno-Product-Telehealth.webp`

#### 4. Avatares dos Depoimentos
**Localização:** Linhas 148-166
```javascript
const testimonials = [
  {
    avatar: "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/66e078d92164d2bde622fad4_Karen-P.jpg"
  },
  // ... mais depoimentos
];
```

#### 5. Logos de Prêmios/Certificações
**Localização:** Linhas 168-173
```javascript
const awards = [
  "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/6830d0b9bcf269bd919269a0_capterrabadge4-7.svg",
  "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/68016bebb87b7cf6cce43e91_Get%20App-Category%20Leaders%202025.svg",
  // ... mais prêmios
];
```

### 🎬 Vídeo do YouTube

#### Modal de Vídeo
**Localização:** Linhas 532-549

Para alterar o vídeo, modifique a URL na linha 541:
```javascript
src="https://www.youtube.com/embed/SEU_VIDEO_ID_AQUI"
```

### 🎨 Como Substituir Imagens

#### Opção 1: Upload para o Projeto
1. Coloque suas imagens na pasta `public/` ou `src/assets/`
2. Altere o caminho na URL:
```javascript
// De:
src="https://cdn.prod.website-files.com/..."

// Para:
src="/sua-imagem.jpg" // se estiver em public/
// ou
import suaImagem from "@/assets/sua-imagem.jpg";
src={suaImagem}
```

#### Opção 2: URLs Externas
1. Hospede suas imagens em um CDN ou servidor
2. Substitua diretamente a URL

### 📝 Texto e Conteúdo

#### Títulos e Descrições
- **Título principal:** Linha 247-256
- **Descrição principal:** Linha 257-259
- **Títulos das features:** No array `features`, propriedade `title`
- **Descrições das features:** No array `features`, propriedade `subtitle` e `points`

#### Depoimentos
Para adicionar/editar depoimentos, modifique o array `testimonials` (linhas 148-166):
```javascript
{
  quote: "Seu depoimento aqui",
  author: "Nome do Cliente",
  clinic: "Nome da Clínica (Cidade, Estado)",
  avatar: "caminho/para/avatar.jpg"
}
```

### 🔧 Configurações Técnicas

#### Rotas
A landing page está configurada como página inicial (`/`) no arquivo `src/App.tsx`.

#### Navegação
- **Login:** Redireciona para `/clinica-login`
- **Agendar Demo:** Redireciona para `/nova-clinica`
- **Assistir Vídeo:** Abre modal com vídeo do YouTube

#### Responsividade
A página é totalmente responsiva usando classes Tailwind CSS. As imagens se ajustam automaticamente aos diferentes tamanhos de tela.

### 🎯 Dicas de Otimização

1. **Tamanho de Imagens:**
   - Hero image: Recomendado 1200x800px
   - Logos de clínicas: Máximo 150x50px
   - Features: 1200x800px
   - Avatares: 100x100px (circulares)

2. **Formatos Recomendados:**
   - `.webp` para melhor compressão
   - `.jpg` para fotos
   - `.png` para logos com transparência
   - `.svg` para ícones e logos vetoriais

3. **Performance:**
   - Use lazy loading para imagens abaixo da dobra
   - Otimize todas as imagens antes do upload
   - Considere usar um CDN para imagens

### 📋 Checklist de Customização

- [ ] Substituir imagem hero principal
- [ ] Atualizar logos das clínicas no slider
- [ ] Trocar imagens das features/recursos
- [ ] Atualizar avatares dos depoimentos
- [ ] Modificar logos de prêmios/certificações
- [ ] Configurar vídeo do YouTube
- [ ] Revisar todos os textos e traduções
- [ ] Testar responsividade em diferentes dispositivos
- [ ] Verificar performance das imagens

### 🔗 Links Úteis

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Lucide React Icons](https://lucide.dev/)