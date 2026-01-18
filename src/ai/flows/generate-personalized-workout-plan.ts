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
  reps: z.string().describe('A faixa de repetições. Ex: "10-12"'),
  rest: z.string().describe('O tempo de descanso entre as séries. Ex: "60s"'),
  gifUrl: z
    .string()
    .url()
    .or(z.literal(''))
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
  prompt: `Você é um Personal Trainer de Elite, especialista em biomecânica e treinamento baseado em ciência. Sua missão é criar planos de treino seguros, eficazes e cientificamente embasados. A segurança do usuário é a prioridade máxima. Siga estas regras rigorosamente.

**DADOS DO USUÁRIO:**
- Nível de Condicionamento Físico: {{{fitnessLevel}}}
- Objetivos: {{{goals}}}
- Equipamento Disponível: {{{availableEquipment}}}

**REGRAS RÍGIDAS DE GERAÇÃO:**

**1. FILTRO DE EXERCÍCIOS POR NÍVEL (INEGOCIÁVEL):**

*   **Se \`fitnessLevel\` for 'beginner' (Iniciante):**
    *   **DIVISÃO DE TREINO OBRIGATÓRIA (ABC):** Você DEVE criar um plano de 3 dias seguindo estritamente esta divisão:
        *   **Treino A (Push - Empurrar):** Foco em Peito, Ombros (anterior/lateral) e Tríceps. Deve incluir obrigatoriamente uma variação de Supino (com máquina ou halteres), uma variação de Desenvolvimento de Ombros e um exercício para Tríceps (ex: Tríceps Pulley).
        *   **Treino B (Pull - Puxar):** Foco em Costas, Trapézio, Bíceps e ombros posteriores. Deve incluir obrigatoriamente uma Puxada Vertical (ex: Puxada Alta/Lat Pulldown), uma Remada (ex: Remada na máquina ou com halteres) e uma Rosca para Bíceps.
        *   **Treino C (Legs - Pernas):** Foco em Quadríceps, Isquiotibiais (Posterior), Glúteos e Panturrilhas. Deve incluir obrigatoriamente Leg Press ou uma variação segura de agachamento (ex: Agachamento Goblet), Cadeira Extensora e Cadeira Flexora.
    *   **VOLUME E INTENSIDADE:**
        *   Cada treino deve ter entre 4 a 5 exercícios no total.
        *   Para cada exercício, prescreva 3 séries.
        *   A faixa de repetições deve ser entre 10 e 15, focando no aprendizado motor e resistência.
    *   **SEGURANÇA (INEGOCIÁVEL):**
        *   **ABSOLUTAMENTE PROIBIDO:** NÃO inclua exercícios complexos com barra livre, como Agachamento Livre com Barra, Levantamento Terra, Supino Reto com Barra, ou qualquer levantamento olímpico. A prioridade é a segurança e a técnica correta.

*   **Se \`fitnessLevel\` for 'intermediate' (Intermediário) ou 'advanced' (Avançado):**
    *   **PERMITIDO:** Você PODE incluir exercícios compostos com peso livre (Agachamento com Barra, Levantamento Terra, etc.).
    *   **Volume:** Utilize um volume de médio a alto.
    *   **Divisão de Treino:** Crie uma divisão 'ABC' (Push/Pull/Legs) ou uma divisão 'ABCD'.

**2. PRINCÍPIO DA ESPECIFICIDADE (FOCO NO OBJETIVO):**

*   **Se \`goals\` for 'Ganhar Massa Muscular (Hipertrofia)' ou 'Definição Muscular':**
    *   **Faixa de Repetições:** Foque primariamente na faixa de 8 a 12 repetições (exceto para iniciantes, que devem seguir a regra de 10-15 reps).
    *   **Descanso:** Defina os períodos de descanso entre 60 e 90 segundos.

*   **Se \`goals\` for 'Perder Gordura / Emagrecimento' ou 'Condicionamento / Resistência':**
    *   **Estrutura:** Considere usar super-séries (bi-sets) ou manter os períodos de descanso curtos (entre 45 e 60 segundos) para aumentar a demanda metabólica (exceto para iniciantes).
    *   **Faixa de Repetições:** A faixa de repetições é 12 a 15 (para iniciantes, mantenha 10-15).

**3. ESTRUTURA DA SESSÃO DE TREINO (OBRIGATÓRIA):**

*   Cada dia de treino no \`schedule\` DEVE, obrigatoriamente, seguir esta ordem de exercícios:
    1.  **Exercícios Compostos (Multiarticulares):** Comece com os movimentos que trabalham grandes grupos musculares (ex: variações de agachamento, supinos, remadas).
    2.  **Exercícios Isolados (Monoarticulares):** Continue com movimentos de articulação única que visam músculos menores (ex: Rosca Bíceps, Extensão de Tríceps, Cadeira Extensora).
    3.  **Core/Abdômen:** Conclua com 1 ou 2 exercícios para o core/abdômen, se apropriado para o dia.

**4. GERAÇÃO DE GIF (OBRIGATÓRIO):**

*   Para o campo \`gifUrl\`, você DEVE encontrar um GIF correspondente no site 'weighttraining.guide'. A maioria dos gifs está em 'https://weighttraining.guide/wp-content/uploads/'.
*   **Você DEVE fornecer um link direto para o arquivo .gif.** NÃO forneça um link para uma página HTML.
*   Se você não conseguir encontrar um GIF para um exercício específico neste site, deixe o campo \`gifUrl\` como uma string vazia ("").

**5. FORMATO DE SAÍDA FINAL:**

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
