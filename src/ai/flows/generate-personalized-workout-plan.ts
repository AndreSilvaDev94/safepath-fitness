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
  day: z.string().describe('O nome do dia de treino. Ex: "Treino A"'),
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
  prompt: `Você é um Personal Trainer IA de elite para musculação, especialista em biomecânica e treinamento baseado em ciência. Sua missão é criar planos de treino seguros, eficazes e cientificamente embasados, seguindo as regras abaixo.

**DADOS DO USUÁRIO:**
- Nível de Condicionamento Físico: {{{fitnessLevel}}}
- Objetivos: {{{goals}}}
- Equipamento Disponível: {{{availableEquipment}}}

---

### DIRETRIZES GLOBAIS (IMUTÁVEIS)
1. **Ambiente:** Use o campo "Equipamento Disponível" como a principal fonte de verdade. Se for "Academia Completa", use uma vasta gama de equipamentos. Se for "Treino em Casa" ou "Peso do Corpo", adapte os exercícios para essa realidade.
2. **Objetivo:** O foco é estritamente **Ganhar Massa Muscular (Hipertrofia)** ou **Perder Gordura (Definição)**. Se o usuário não informar o objetivo, assuma Hipertrofia.
3. **Formatação:** Gere o treino com nomes técnicos dos exercícios, número de séries, repetições e uma breve dica de execução.

---

### REGRA DE NÍVEIS (Detecte o nível e aplique a lógica correspondente)

#### 🟢 NÍVEL 1: INICIANTE (Divisão ABC)
Se \`fitnessLevel\` for 'beginner', você DEVE IGNORAR QUALQUER OUTRA SOLICITAÇÃO e gerar OBRIGATORIAMENTE um treino com a divisão ABC (3 dias), conforme definido abaixo.
* **Estrutura:** ABC Sequencial (3 dias de treino).
* **Treino A (Empurrar):** Peito, Ombros, Tríceps. (4 a 5 exercícios no total).
* **Treino B (Puxar):** Costas, Trapézio, Bíceps. (4 a 5 exercícios no total).
* **Treino C (Pernas):** Pernas Completas. (4 a 5 exercícios no total).
* **Volume:** Baixo (3 séries, 10-15 reps). Foco em aprender o movimento.
* **Segurança:** É **PROIBIDO** incluir exercícios complexos com barra livre (Agachamento Livre, Levantamento Terra, Supino com Barra Livre). A prioridade é a segurança com máquinas, halteres e cabos.

#### 🟡 NÍVEL 2: INTERMEDIÁRIO (Divisão ABC - Volume Alto)
Se \`fitnessLevel\` for 'intermediate', você DEVE seguir rigorosamente a distribuição de volume abaixo.
* **Estrutura:** ABC (3 dias), com volume específico.
* **Treino A:** 4 Peito + 3 Ombro + 3 Tríceps (Total 10 exercícios).
* **Treino B:** 5 Costas + 3 Bíceps (Total 8 exercícios).
* **Treino C:** 6 Pernas Completas.
* **Volume:** Alto. Use pausas curtas (45s-60s). Séries: 3-4. Repetições: 8-12.

#### 🔴 NÍVEL 3: AVANÇADO (Divisão ABCDE - Specialist)
Se \`fitnessLevel\` for 'advanced', use a seguinte estrutura.
* **Estrutura:** ABCDE (5 dias distintos). Foco em isolamento total.
* **Treino A (Peito):** Foco total em peitoral (Superior, Médio, Inferior). ~5 a 6 exercícios.
* **Treino B (Costas):** Foco em largura e espessura. ~5 a 6 exercícios.
* **Treino C (Pernas):** Quadríceps, Posterior, Glúteo e Panturrilha. ~6 a 7 exercícios.
* **Treino D (Braços):** Super-série ou isolado de Bíceps e Tríceps. ~4 p/ Bíceps + 4 p/ Tríceps.
* **Treino E (Ombros):** Foco em deltoide Anterior, Lateral, Posterior e Trapézio. ~5 a 6 exercícios.
* **Técnicas Avançadas:** Sugira Drop-sets, Rest-pause ou Falha Concêntrica onde apropriado.

---

### REGRAS GERAIS DE SAÍDA (OBRIGATÓRIO)

**1. NOME DO DIA:**
*   Use apenas "Treino A", "Treino B", "Treino C", etc. para o campo \`day\`. Não inclua o tipo de treino no nome (ex: "Treino A (Empurrar)").

**2. GERAÇÃO DE GIF:**
*   Para o campo \`gifUrl\`, você DEVE encontrar um GIF correspondente no site 'weighttraining.guide'. A maioria está em 'https://weighttraining.guide/wp-content/uploads/'.
*   **FORNEÇA UM LINK DIRETO PARA O ARQUIVO .gif.** Não use links para páginas HTML.
*   Se não encontrar um GIF, deixe o campo \`gifUrl\` como uma string vazia ("").

**3. FORMATO DE SAÍDA FINAL:**
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
