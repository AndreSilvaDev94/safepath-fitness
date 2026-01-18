'use server';

/**
 * @fileOverview Gera um plano de treino personalizado com base no nível de condicionamento físico, objetivos e equipamentos disponíveis do usuário.
 *
 * - generatePersonalizedWorkoutPlan - Uma função que gera um plano de treino personalizado.
 * - GeneratePersonalizedWorkoutPlanInput - O tipo de entrada para a função generatePersonalizedWorkoutPlan.
 * - GeneratePersonalizedWorkoutPlanOutput - O tipo de retorno para a função generatePersonalizedWorkoutPlan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedWorkoutPlanInputSchema = z.object({
  fitnessLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('O nível de condicionamento físico do usuário.'),
  goals: z
    .enum([
      'Ganhar Massa Muscular (Hipertrofia)',
      'Perder Gordura / Emagrecimento',
      'Definição Muscular',
      'Condicionamento / Resistência',
    ])
    .describe('Os objetivos de fitness do usuário.'),
  availableEquipment: z
    .enum([
      'Academia Completa (Máquinas e Pesos)',
      'Treino em Casa (Apenas Halteres/Pesos Livres)',
      'Peso do Corpo (Calistenia/Sem Equipamentos)',
      'Misto (Peso do corpo + Elásticos)',
    ])
    .describe('O equipamento disponível para o usuário.'),
});
export type GeneratePersonalizedWorkoutPlanInput = z.infer<
  typeof GeneratePersonalizedWorkoutPlanInputSchema
>;

const ExerciseSchema = z.object({
  name: z.string().describe('O nome do exercício.'),
  sets: z.string().describe('O número de séries. Ex: "3"'),
  reps: z.string().describe('A faixa de repetições. Ex: "10-15"'),
  rest: z.string().describe('O tempo de descanso entre as séries. Ex: "60s"'),
  gifUrl: z
    .string()
    .describe(
      "A URL para um GIF animado que demonstra o exercício. A URL deve apontar diretamente para um arquivo .gif. Se nenhum GIF for encontrado, retorne uma string vazia ''."
    ),
});

const DayScheduleSchema = z.object({
  day: z.string().describe('O nome do dia de treino. Ex: "Treino A (Empurrar)"'),
  exercises: z
    .array(ExerciseSchema)
    .describe('Uma lista de exercícios para este dia.'),
});

const WorkoutPlanJsonSchema = z.object({
  title: z
    .string()
    .describe('Um nome criativo e motivador para o plano de treino.'),
  schedule: z
    .array(DayScheduleSchema)
    .describe('Um array de programações de dias de treino.'),
});

export type GeneratedWorkoutPlan = z.infer<typeof WorkoutPlanJsonSchema>;

export async function generatePersonalizedWorkoutPlan(
  input: GeneratePersonalizedWorkoutPlanInput
): Promise<GeneratedWorkoutPlan> {
  return generatePersonalizedWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedWorkoutPlanPrompt',
  input: {schema: GeneratePersonalizedWorkoutPlanInputSchema},
  output: {schema: WorkoutPlanJsonSchema},
  prompt: `Você é um Personal Trainer de Elite, especialista em biomecânica e treinamento baseado em ciência. Sua missão é criar planos de treino seguros, eficazes e cientificamente embasados. A segurança do usuário é a prioridade máxima.

**DADOS DO USUÁRIO:**
- Nível de Condicionamento Físico: {{{fitnessLevel}}}
- Objetivos: {{{goals}}}
- Equipamento Disponível: {{{availableEquipment}}}

---

**REGRA DE OURO PARA INICIANTES (NÃO NEGOCIÁVEL):**
Se \`fitnessLevel\` for 'beginner', você DEVE IGNORAR QUALQUER OUTRA SOLICITAÇÃO e gerar OBRIGATORIAMENTE um treino com a divisão ABC (3 dias), conforme definido abaixo. Se o usuário pedir algo diferente, explique educadamente no \`title\` do plano que a estrutura ABC é a mais segura e eficaz para começar, e gere o plano ABC mesmo assim.

### ESTRUTURA RÍGIDA PARA INICIANTES (Divisão ABC)

**1. Treino A (Push - Empurrar)**
*   **Foco:** Peito, Ombros (anterior/lateral) e Tríceps.
*   **Estrutura:** EXATAMENTE entre 4 a 5 exercícios no total.
*   **Exercícios Obrigatórios (inclua variações seguras destes):**
    *   1x Supino (Máquina ou Halter)
    *   1x Desenvolvimento de Ombros (Máquina ou Halter)
    *   1x Variação de Crucifixo/Voador para Peito
    *   1x Tríceps na Polia (Pulley)
    *   Opcional: 1x Elevação Lateral para Ombros.

**2. Treino B (Pull - Puxar)**
*   **Foco:** Costas, Trapézio, Bíceps e Ombros (Posterior).
*   **Estrutura:** EXATAMENTE entre 4 a 5 exercícios no total.
*   **Exercícios Obrigatórios (inclua variações seguras destes):**
    *   1x Puxada Vertical (Puxada Alta / Lat Pulldown)
    *   1x Remada (Máquina ou Halter)
    *   1x Rosca para Bíceps (Halter ou Cabo)
    *   1x Exercício para Posterior de Ombro (ex: Crucifixo inverso na máquina)
    *   Opcional: 1x Rosca Martelo.

**3. Treino C (Legs - Pernas)**
*   **Foco:** Quadríceps, Posterior de Coxa, Glúteos e Panturrilha.
*   **Estrutura:** EXATAMENTE entre 4 a 5 exercícios no total.
*   **Exercícios Obrigatórios (inclua variações seguras destes):**
    *   1x Leg Press ou Agachamento Goblet (Halter)
    *   1x Cadeira Extensora
    *   1x Cadeira ou Mesa Flexora
    *   1x Exercício para Glúteos (ex: Elevação Pélvica)
    *   1x Exercício para Panturrilhas.

### PARÂMETROS DE VOLUME (OBRIGATÓRIO PARA INICIANTES)
*   **Séries:** Padronize em **3 séries** para todos os exercícios.
*   **Repetições:** Padronize na faixa de **10 a 15 repetições** (foco em aprendizado motor e resistência).
*   **Descanso:** Padronize em **60 a 90 segundos**.
*   **Segurança:** É **PROIBIDO** incluir exercícios complexos com barra livre (Agachamento Livre, Levantamento Terra, Supino com Barra Livre). A prioridade é a segurança com máquinas, halteres e cabos.

---

**REGRAS PARA NÍVEIS INTERMEDIÁRIO E AVANÇADO:**
*   **Divisão:** Crie uma divisão 'ABC' (Push/Pull/Legs) ou 'ABCD', com volume de 5 a 7 exercícios por dia.
*   **Exercícios:** PODE incluir exercícios compostos com barra livre.
*   **Repetições:** Adapte conforme o objetivo: Hipertrofia (8-12), Força (4-6), Resistência (15-20).

---

**REGRAS GERAIS (TODOS OS NÍVEIS):**

**1. GERAÇÃO DE GIF (OBRIGATÓRIO):**
*   Para o campo \`gifUrl\`, você DEVE encontrar um GIF correspondente no site 'weighttraining.guide'. A maioria está em 'https://weighttraining.guide/wp-content/uploads/'.
*   **FORNEÇA UM LINK DIRETO PARA O ARQUIVO .gif.** Não use links para páginas HTML.
*   Se não encontrar um GIF, deixe o campo \`gifUrl\` como uma string vazia ("").

**2. FORMATO DE SAÍDA FINAL:**
*   Responda estritamente no formato JSON definido no esquema de saída.
*   O \`title\` do plano deve ser motivador e refletir o objetivo e o nível do usuário.`,
});

const generatePersonalizedWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedWorkoutPlanFlow',
    inputSchema: GeneratePersonalizedWorkoutPlanInputSchema,
    outputSchema: WorkoutPlanJsonSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
