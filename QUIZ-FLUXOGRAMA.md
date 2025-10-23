# 🎯 Fluxograma Completo do Sistema de Quiz - MENVO

## 📊 Visão Geral do Fluxo

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    1. PÁGINA INICIAL DO QUIZ                        │
│                      app/quiz/page.tsx                              │
│                                                                     │
│  INPUT:                                                             │
│  • Usuário clica em "Começar Questionário"                         │
│  • Estado: showQuiz = false → true                                 │
│                                                                     │
│  OUTPUT:                                                            │
│  • Renderiza <QuizForm />                                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    2. COMPONENTE QUIZ FORM                          │
│                  components/quiz/QuizForm.tsx                       │
│                                                                     │
│  INPUT:                                                             │
│  • Props: onSubmit, onBack                                          │
│  • Estado local: formData (Partial<QuizFormData>)                  │
│  • currentStep (1-8)                                                │
│                                                                     │
│  PROCESSAMENTO:                                                     │
│  • Renderiza 8 perguntas sequencialmente                           │
│  • Valida cada resposta antes de avançar                           │
│  • Armazena respostas em formData                                  │
│                                                                     │
│  PERGUNTAS:                                                         │
│  1. Momento de carreira (RadioGroup)                               │
│  2. Desafio profissional (TextareaWithVoice)                       │
│  3. Experiência com mentoria (RadioGroup)                          │
│  4. Visão de futuro (TextareaWithVoice)                            │
│  5. Áreas de desenvolvimento (Checkbox múltiplo)                   │
│  6. Ajuda vida pessoal (TextareaWithVoice)                         │
│  7. Compartilhar conhecimento (RadioGroup)                         │
│  8. Dados de contato (Input: nome, email, linkedin)               │
│                                                                     │
│  OUTPUT:                                                            │
│  • Ao finalizar: chama onSubmit(formData)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 3. HANDLER DE SUBMIT (Frontend)                     │
│              app/quiz/page.tsx → handleQuizSubmit()                 │
│                                                                     │
│  INPUT:                                                             │
│  • data: QuizFormData (todas as respostas)                         │
│                                                                     │
│  PROCESSAMENTO:                                                     │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 3.1. Criar cliente Supabase                             │      │
│  │      const supabase = createClient()                    │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 3.2. Inserir no banco de dados                          │      │
│  │      supabase.from("quiz_responses").insert({...})      │      │
│  │                                                          │      │
│  │      Campos salvos:                                      │      │
│  │      • name, email, linkedin_url                         │      │
│  │      • career_moment                                     │      │
│  │      • mentorship_experience                             │      │
│  │      • development_areas (array)                         │      │
│  │      • current_challenge                                 │      │
│  │      • future_vision                                     │      │
│  │      • share_knowledge                                   │      │
│  │      • personal_life_help                                │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 3.3. Enviar email de convite (fire & forget)            │      │
│  │      supabase.functions.invoke("send-invite-email")     │      │
│  │      • Não bloqueia o fluxo                              │      │
│  │      • Erro é apenas logado                              │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 3.4. Toast de feedback                                   │      │
│  │      "Questionário enviado!"                             │      │
│  │      "Processando sua análise com IA..."                │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 3.5. Chamar Edge Function de análise                    │      │
│  │      supabase.functions.invoke("analyze-quiz")          │      │
│  │      body: { responseId: response.id }                   │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  OUTPUT:                                                            │
│  • Redireciona para: /quiz/results/{response.id}                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BANCO DE DADOS                              │
│                    Supabase PostgreSQL                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  4. TABELA: quiz_responses                          │
│                                                                     │
│  ESTRUTURA:                                                         │
│  • id (UUID, PK)                                                    │
│  • name (text)                                                      │
│  • email (text)                                                     │
│  • linkedin_url (text, nullable)                                    │
│  • career_moment (text)                                             │
│  • mentorship_experience (text)                                     │
│  • development_areas (text[])                                       │
│  • current_challenge (text)                                         │
│  • future_vision (text)                                             │
│  • share_knowledge (text)                                           │
│  • personal_life_help (text)                                        │
│  • score (integer, nullable) ← calculado pela IA                   │
│  • ai_analysis (jsonb, nullable) ← resultado da análise            │
│  • processed_at (timestamp, nullable)                               │
│  • email_sent (boolean, default false)                              │
│  • email_sent_at (timestamp, nullable)                              │
│  • created_at (timestamp)                                           │
│  • updated_at (timestamp)                                           │
│                                                                     │
│  RLS POLICIES:                                                      │
│  • Public pode inserir (quiz público)                               │
│  • Public pode ler por email                                        │
│  • Public pode atualizar (para Edge Functions)                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EDGE FUNCTIONS (Deno)                          │
│                    Supabase Functions                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              5. EDGE FUNCTION: analyze-quiz                         │
│           supabase/functions/analyze-quiz/index.ts                  │
│                                                                     │
│  INPUT:                                                             │
│  • body: { responseId: string }                                     │
│                                                                     │
│  PROCESSAMENTO:                                                     │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 5.1. Buscar resposta do banco                            │      │
│  │      SELECT * FROM quiz_responses WHERE id = ?           │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 5.2. Buscar mentores disponíveis                         │      │
│  │      SELECT * FROM profiles                              │      │
│  │      WHERE is_mentor = true                              │      │
│  │      AND availability_status = 'available'               │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 5.3. Gerar prompt para IA                                │      │
│  │      generateAnalysisPrompt(response, mentors)           │      │
│  │                                                          │      │
│  │      Inclui:                                             │      │
│  │      • Todas as respostas do usuário                     │      │
│  │      • Lista de mentores reais disponíveis               │      │
│  │      • Instruções de análise                             │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 5.4. Chamar OpenAI API                                   │      │
│  │      Model: gpt-4o-mini                                  │      │
│  │      Temperature: 0.7                                    │      │
│  │      Response format: JSON                               │      │
│  │                                                          │      │
│  │      Solicita:                                           │      │
│  │      • Pontuação (0-1000)                                │      │
│  │      • Título personalizado                              │      │
│  │      • Resumo motivador                                  │      │
│  │      • Mentores sugeridos (com nomes reais)              │      │
│  │      • Conselhos práticos                                │      │
│  │      • Próximos passos                                   │      │
│  │      • Áreas de desenvolvimento                          │      │
│  │      • Mensagem final                                    │      │
│  │      • Potencial mentor (boolean)                        │      │
│  │      • Áreas vida pessoal                                │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 5.5. Fallback se IA falhar                               │      │
│  │      generateFallbackAnalysis(response, mentors)         │      │
│  │      • Análise baseada em regras                         │      │
│  │      • Garante que sempre há resultado                   │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 5.6. Atualizar banco com análise                         │      │
│  │      UPDATE quiz_responses SET                           │      │
│  │        ai_analysis = {...},                              │      │
│  │        score = pontuacao,                                │      │
│  │        processed_at = NOW()                              │      │
│  │      WHERE id = responseId                               │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 5.7. Chamar função de envio de email                     │      │
│  │      supabase.functions.invoke("send-quiz-email")        │      │
│  │      • Assíncrono, não bloqueia                          │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                     │
│  OUTPUT:                                                            │
│  • Status 200 + análise completa                                   │
│  • Ou erro com fallback                                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│           6. EDGE FUNCTION: send-quiz-email                         │
│         supabase/functions/send-quiz-email/index.ts                 │
│                                                                     │
│  INPUT:                                                             │
│  • body: { responseId: string }                                     │
│                                                                     │
│  PROCESSAMENTO:                                                     │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 6.1. Buscar resposta com análise                         │      │
│  │      SELECT * FROM quiz_responses WHERE id = ?           │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 6.2. Verificar se já foi enviado                         │      │
│  │      if (email_sent) return                              │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 6.3. Montar HTML do email                                │      │
│  │      • Título personalizado                              │      │
│  │      • Pontuação                                         │      │
│  │      • Resumo da análise                                 │      │
│  │      • Link para ver resultado completo                  │      │
│  │      • Brinde (se score >= 700)                          │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 6.4. Enviar via Brevo API                                │      │
│  │      POST https://api.brevo.com/v3/smtp/email            │      │
│  │      • From: contato@menvo.com.br                        │      │
│  │      • To: user email                                    │      │
│  │      • Subject: "Sua Análise Personalizada - MENVO"      │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 6.5. Atualizar status de envio                           │      │
│  │      UPDATE quiz_responses SET                           │      │
│  │        email_sent = true,                                │      │
│  │        email_sent_at = NOW()                             │      │
│  │      WHERE id = responseId                               │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                     │
│  OUTPUT:                                                            │
│  • Status 200 se sucesso                                            │
│  • Erro se falhar                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│           7. EDGE FUNCTION: send-invite-email                       │
│        supabase/functions/send-invite-email/index.ts                │
│                                                                     │
│  INPUT:                                                             │
│  • body: { name: string, email: string }                            │
│                                                                     │
│  PROCESSAMENTO:                                                     │
│  • Envia email de boas-vindas                                       │
│  • Convite para acessar plataforma MENVO                           │
│  • Não bloqueia o fluxo principal                                  │
│                                                                     │
│  OUTPUT:                                                            │
│  • Fire & forget (erro apenas logado)                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                8. PÁGINA DE RESULTADOS                              │
│              app/quiz/results/[id]/page.tsx                         │
│                                                                     │
│  INPUT:                                                             │
│  • params.id (UUID da resposta)                                     │
│                                                                     │
│  PROCESSAMENTO:                                                     │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 8.1. useEffect ao montar                                 │      │
│  │      loadResults()                                       │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 8.2. Buscar resultado do banco                           │      │
│  │      SELECT * FROM quiz_responses WHERE id = ?           │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 8.3. Verificar se processado                             │      │
│  │      if (!processed_at) {                                │      │
│  │        setTimeout(loadResults, 2000) // retry            │      │
│  │      }                                                    │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 8.4. Renderizar análise                                  │      │
│  │      • Título personalizado                              │      │
│  │      • Pontuação                                         │      │
│  │      • Seleção de brinde (se >= 700)                     │      │
│  │      • Mentores sugeridos                                │      │
│  │      • Conselhos práticos                                │      │
│  │      • Próximos passos                                   │      │
│  │      • Áreas de desenvolvimento                          │      │
│  │      • Mensagem final                                    │      │
│  │      • Badge "Potencial Mentor" (se aplicável)           │      │
│  └─────────────────────────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ 8.5. Ações de compartilhamento                           │      │
│  │      • Enviar por email (chama send-quiz-email)          │      │
│  │      • Compartilhar no WhatsApp                          │      │
│  │      • Compartilhar no LinkedIn                          │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                     │
│  OUTPUT:                                                            │
│  • Interface visual com toda análise                                │
│  • Opções de compartilhamento                                      │
│  • Seleção de brinde (se elegível)                                 │
└─────────────────────────────────────────────────────────────────────┘


---

## 🔄 Fluxo Resumido por Camadas

### 📱 CAMADA DE APRESENTAÇÃO (Frontend)
```
app/quiz/page.tsx
    ↓
components/quiz/QuizForm.tsx
    ↓
app/quiz/results/[id]/page.tsx
```

**Responsabilidades:**
- Capturar input do usuário (8 perguntas)
- Validar respostas antes de avançar
- Exibir feedback visual (toast, loading)
- Renderizar resultados da análise
- Permitir compartilhamento

---

### 🎣 CAMADA DE HOOKS (Estado e Lógica)
```
hooks/useToast.ts
    ↓ (feedback visual)
useState/useEffect
    ↓ (gerenciamento de estado local)
```

**Responsabilidades:**
- Gerenciar estado do formulário
- Controlar navegação entre perguntas
- Polling de resultados (retry se não processado)
- Feedback de loading/erro

---

### 🔧 CAMADA DE SERVIÇOS (Client-side)
```
utils/supabase/client.ts
    ↓ (cliente Supabase)
Supabase Client API
```

**Responsabilidades:**
- Criar cliente Supabase autenticado
- Fazer queries ao banco
- Invocar Edge Functions
- Gerenciar conexão

---

### 💾 CAMADA DE BANCO DE DADOS
```
PostgreSQL (Supabase)
    ↓
quiz_responses (tabela principal)
    ├─ Dados do usuário
    ├─ Respostas do quiz
    ├─ Análise da IA (JSONB)
    └─ Metadados (timestamps, flags)
    
profiles (tabela de mentores)
    └─ Mentores disponíveis para matching
```

**Responsabilidades:**
- Persistir respostas do quiz
- Armazenar análise da IA
- Controlar status de processamento
- Rastrear envio de emails
- RLS para segurança

---

### ⚡ CAMADA DE EDGE FUNCTIONS (Backend Serverless)

#### Function 1: analyze-quiz
```
supabase/functions/analyze-quiz/index.ts
    ↓
1. Busca resposta do banco
2. Busca mentores disponíveis
3. Gera prompt para IA
4. Chama OpenAI API (gpt-4o-mini)
5. Processa resposta JSON
6. Fallback se IA falhar
7. Atualiza banco com análise
8. Dispara envio de email
```

**Responsabilidades:**
- Orquestrar análise com IA
- Fazer matching com mentores reais
- Calcular pontuação
- Garantir fallback
- Atualizar banco de dados

#### Function 2: send-quiz-email
```
supabase/functions/send-quiz-email/index.ts
    ↓
1. Busca resposta com análise
2. Verifica se já enviou
3. Monta HTML do email
4. Envia via Brevo API
5. Atualiza flag email_sent
```

**Responsabilidades:**
- Enviar email com resultados
- Integração com Brevo
- Controle de duplicação
- Atualizar status

#### Function 3: send-invite-email
```
supabase/functions/send-invite-email/index.ts
    ↓
1. Recebe nome e email
2. Envia convite para MENVO
3. Fire & forget (não bloqueia)
```

**Responsabilidades:**
- Email de boas-vindas
- Convite para plataforma
- Não bloqueia fluxo principal

---

### 🤖 CAMADA DE IA (Serviço Externo)
```
OpenAI API
    ↓
Model: gpt-4o-mini
Temperature: 0.7
Response: JSON estruturado
```

**Responsabilidades:**
- Analisar respostas do usuário
- Gerar insights personalizados
- Sugerir mentores adequados
- Calcular pontuação
- Identificar potencial mentor

---

## 📊 Estrutura de Dados

### QuizFormData (Input)
```typescript
{
  careerMoment: string
  mentorshipExperience: string
  developmentAreas: string[]
  developmentAreasOther?: string
  currentChallenge: string
  futureVision: string
  shareKnowledge: string
  personalLifeHelp: string
  name: string
  email: string
  linkedinUrl?: string
}
```

### AnalysisResult (Output da IA)
```typescript
{
  precisa_refazer?: boolean
  titulo_personalizado: string
  resumo_motivador: string
  mentores_sugeridos: Array<{
    tipo: string
    razao: string
    disponivel: boolean
    mentor_nome?: string
  }>
  conselhos_praticos: string[]
  proximos_passos: string[]
  areas_desenvolvimento: string[]
  mensagem_final: string
  potencial_mentor: boolean
  areas_vida_pessoal: string[]
}
```

### QuizResponse (Banco de Dados)
```typescript
{
  id: UUID
  name: string
  email: string
  linkedin_url?: string
  career_moment: string
  mentorship_experience: string
  development_areas: string[]
  current_challenge: string
  future_vision: string
  share_knowledge: string
  personal_life_help: string
  score: number
  ai_analysis: AnalysisResult (JSONB)
  processed_at: timestamp
  email_sent: boolean
  email_sent_at: timestamp
  created_at: timestamp
  updated_at: timestamp
}
```

---

## 🔐 Segurança e Políticas RLS

```sql
-- Qualquer um pode inserir (quiz público)
CREATE POLICY "Public can submit quiz responses"
  ON quiz_responses FOR INSERT TO public
  WITH CHECK (true);

-- Qualquer um pode ler por email
CREATE POLICY "Anyone can read responses by email"
  ON quiz_responses FOR SELECT TO public
  USING (true);

-- Qualquer um pode atualizar (para Edge Functions)
CREATE POLICY "Public can update quiz responses"
  ON quiz_responses FOR UPDATE TO public
  USING (true);
```

---

## ⏱️ Fluxo Temporal

```
T0: Usuário inicia quiz
    ↓ (0-5 min)
T1: Usuário completa 8 perguntas
    ↓ (< 1s)
T2: Dados salvos no banco
    ↓ (< 1s)
T3: Email de convite enviado (async)
    ↓ (< 1s)
T4: Redirecionamento para /results
    ↓ (2-5s)
T5: Edge Function processa com IA
    ↓ (< 1s)
T6: Análise salva no banco
    ↓ (< 1s)
T7: Email com resultados enviado
    ↓ (polling a cada 2s)
T8: Frontend detecta processed_at
    ↓ (instantâneo)
T9: Resultados exibidos ao usuário
```

**Tempo total:** ~5-10 segundos após submit

---

## 🎯 Pontos de Integração

### Frontend ↔ Supabase Client
- `createClient()` - Cria cliente autenticado
- `.from('quiz_responses')` - Queries ao banco
- `.functions.invoke()` - Chama Edge Functions

### Edge Functions ↔ OpenAI
- `fetch('https://api.openai.com/v1/chat/completions')`
- Headers: Authorization Bearer token
- Body: messages com prompt estruturado
- Response: JSON com análise

### Edge Functions ↔ Brevo
- `fetch('https://api.brevo.com/v3/smtp/email')`
- Headers: api-key
- Body: sender, to, subject, htmlContent
- Response: messageId

### Edge Functions ↔ Database
- Supabase Admin Client (service_role)
- Bypass RLS para operações internas
- Transações para consistência

---

## 🚨 Tratamento de Erros

### Frontend
- Try/catch em handleQuizSubmit
- Toast de erro se falhar
- Não bloqueia se email de convite falhar

### Edge Functions
- Try/catch em cada função
- Fallback analysis se IA falhar
- Logs detalhados de erro
- Status HTTP apropriados

### Banco de Dados
- Constraints para validação
- Indexes para performance
- RLS para segurança

---

## 🔄 Retry e Resilência

### Polling de Resultados
```typescript
if (!data.processed_at) {
  setTimeout(loadResults, 2000) // retry após 2s
  return
}
```

### Fire & Forget
```typescript
// Email de convite não bloqueia
supabase.functions.invoke("send-invite-email")
  .catch(err => console.error(err))
```

### Fallback de IA
```typescript
// Se OpenAI falhar, usa análise baseada em regras
if (analysisError) {
  analysisResult = generateFallbackAnalysis(response, mentors)
}
```

---

## 📈 Métricas e Monitoramento

### Queries Úteis
```sql
-- Total de respostas
SELECT COUNT(*) FROM quiz_responses;

-- Pontuação média
SELECT AVG(score) FROM quiz_responses WHERE score IS NOT NULL;

-- Taxa de processamento
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN processed_at IS NOT NULL THEN 1 ELSE 0 END) as processados,
  ROUND(100.0 * SUM(CASE WHEN processed_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as taxa
FROM quiz_responses;

-- Taxa de envio de email
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN email_sent THEN 1 ELSE 0 END) as enviados,
  ROUND(100.0 * SUM(CASE WHEN email_sent THEN 1 ELSE 0 END) / COUNT(*), 2) as taxa_envio
FROM quiz_responses;
```

---

## 🎨 Para Visualizar no Excalidraw

Este arquivo pode ser usado como referência para criar um diagrama visual no Excalidraw. Sugestões de elementos:

1. **Retângulos azuis** - Componentes Frontend
2. **Retângulos verdes** - Edge Functions
3. **Cilindros** - Banco de Dados
4. **Nuvens** - Serviços Externos (OpenAI, Brevo)
5. **Setas** - Fluxo de dados
6. **Cores** - Diferenciar camadas
7. **Ícones** - Representar ações (📧 email, 🤖 IA, 💾 banco)

---

**Criado para:** Projeto MENVO - Sistema de Quiz com Análise de IA
**Última atualização:** 2025-01-13
