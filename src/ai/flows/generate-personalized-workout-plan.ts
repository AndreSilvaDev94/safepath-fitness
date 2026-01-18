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
  prompt: `Você é um Personal Trainer IA de elite, especializado em musculação e fisiculturismo. Sua missão é gerar treinos técnicos e precisos.

**DADOS DO USUÁRIO:**
- Nível de Condicionamento Físico: {{{fitnessLevel}}}
- Objetivos: {{{goals}}}
- Equipamento Disponível: {{{availableEquipment}}}

---

### DIRETRIZES GLOBAIS (Obrigatórias)
1. **AMBIENTE:** Assuma SEMPRE que o usuário treina em uma **ACADEMIA COMPLETA**. Ignore a informação de 'Equipamento Disponível' e sempre gere treinos para um ambiente com todos os equipamentos. Não sugira treinos em casa ou com peso do corpo (exceto calistenia avançada).
2. **OBJETIVO:** O foco deve ser estritamente "Ganhar Massa Muscular" (Hipertrofia) ou "Perder Gordura" (Definição), conforme o campo 'Objetivos'. Se o objetivo não for informado, assuma Hipertrofia.
3. **FORMATO:** Use nomes técnicos dos exercícios, número exato de séries e repetições.

---

### REGRAS MESTRAS POR NÍVEL (Detecte o nível e aplique a lógica correspondente)

#### 🟢 NÍVEL INICIANTE
Se \`fitnessLevel\` for 'beginner':
- **Estrutura:** Divisão ABC Sequencial (3 dias).
- **Treino A (Empurrar):** Peito, Ombros, Tríceps.
- **Treino B (Puxar):** Costas, Trapézio, Bíceps.
- **Treino C (Pernas):** Membros Inferiores completos.
- **VOLUME RÍGIDO:** Apenas 4 a 5 exercícios totais por dia.
- **Séries/Reps:** 3 séries de 10 a 15 repetições (Foco em resistência e aprendizado).

#### 🟡 NÍVEL INTERMEDIÁRIO
Se \`fitnessLevel\` for 'intermediate':
- **Estrutura:** Divisão ABC (3 dias).
- **VOLUME RÍGIDO (Siga exatamente esta quantidade):**
  * **Treino A:** 4 exercícios de Peito + 3 de Ombro + 3 de Tríceps (Total 10).
  * **Treino B:** 5 exercícios de Costas + 3 de Bíceps (Total 8).
  * **Treino C:** 6 exercícios de Pernas variados (Total 6).
- **Séries/Reps:** 3 a 4 séries de 8 a 12 repetições. Pausas curtas (45s-60s).

#### 🔴 NÍVEL AVANÇADO
Se \`fitnessLevel\` for 'advanced':
- **Estrutura:** Divisão ABCDE (5 dias - Foco em grupos isolados).
- **Divisão:**
  * **Treino A:** Peito Completo (~5-6 exercícios).
  * **Treino B:** Costas Completo (~5-6 exercícios).
  * **Treino C:** Pernas Completo (Quadríceps, Posterior, Glúteo) (~6-7 exercícios).
  * **Treino D:** Braços (Bíceps e Tríceps) (~4 para cada).
  * **Treino E:** Ombros (Anterior, Lateral, Posterior) e Trapézio (~5-6 exercícios).
- **Intensidade:** Alta. Sugira técnicas avançadas (Drop-set, Rest-pause) quando apropriado.

---

### REGRAS GERAIS DE SAÍDA (OBRIGATÓRIO)

1.  **NOME DO DIA:**
    *   Use apenas "Treino A", "Treino B", "Treino C", etc. para o campo \`day\`. Não inclua o tipo de treino no nome (ex: "Treino A (Empurrar)").
2.  **GERAÇÃO DE GIF:**
    *   Para o campo \`gifUrl\`, você DEVE encontrar um GIF correspondente no site 'weighttraining.guide'. A maioria está em 'https://weighttraining.guide/wp-content/uploads/'.
    *   **FORNEÇA UM LINK DIRETO PARA O ARQUIVO .gif.** Não use links para páginas HTML.
    *   Se não encontrar um GIF, deixe o campo \`gifUrl\` como uma string vazia ("").
3.  **FORMATO DE SAÍDA FINAL:**
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
