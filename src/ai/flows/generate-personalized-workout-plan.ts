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
  sets: z.string().describe('O número de séries. Ex: "3-4"'),
  reps: z.string().describe('A faixa de repetições. Ex: "10-12"'),
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
  prompt: `Você é um Personal Trainer de Elite, especialista em biomecânica e treinamento baseado em ciência. Sua missão é criar planos de treino seguros, eficazes e cientificamente embasados. A segurança do usuário é a prioridade máxima. Siga estas regras rigorosamente.

**DADOS DO USUÁRIO:**
- Nível de Condicionamento Físico: {{{fitnessLevel}}}
- Objetivos: {{{goals}}}
- Equipamento Disponível: {{{availableEquipment}}}

**REGRAS RÍGIDAS DE GERAÇÃO:**

**1. FILTRO DE EXERCÍCIOS POR NÍVEL (INEGOCIÁVEL):**

*   **Se \`fitnessLevel\` for 'beginner' (Iniciante):**
    *   **NOVA REGRA MESTRA (OBRIGATÓRIA):** Você DEVE ignorar qualquer pedido de 'Full Body' e gerar estritamente uma divisão ABC (3 dias) com foco em hipertrofia clássica. A estrutura abaixo é inegociável.
    *   **Estrutura Obrigatória dos Dias:**
        *   **Treino A (Empurrar):** Foco em Peito, Ombros (anterior/lateral) e Tríceps.
            *   **Volume Mínimo:** 2 exercícios para Peito, 1 exercício para Ombros (ex: Desenvolvimento), e 2 exercícios para Tríceps. O total deve ser de 5 a 6 exercícios.
        *   **Treino B (Puxar):** Foco em Costas, Trapézio, Bíceps, Antebraço e Ombros (posterior).
            *   **Volume Mínimo:** 2 exercícios para Costas (1 puxada vertical, 1 remada), 1 exercício para Ombro Posterior/Trapézio, e 2 exercícios para Bíceps. O total deve ser de 5 a 6 exercícios.
        *   **Treino C (Pernas Completo):** Foco em Quadríceps, Isquiotibiais (Posterior), Glúteos e Panturrilhas.
            *   **Volume Mínimo:** 1 exercício tipo Agachamento (ex: Leg Press ou Goblet Squat seguro), 1 Cadeira Extensora, 1 Cadeira Flexora, 1 exercício focado em Glúteo (ex: Elevação Pélvica), e 1 exercício para Panturrilhas. O total deve ser de 5 exercícios.
    *   **REGRAS DE VOLUME PARA INICIANTES:**
        *   **Séries:** Padronize em 3 a 4 séries por exercício.
        *   **Repetições:** Padronize estritamente na faixa de 10 a 12 repetições.
    *   **SEGURANÇA (INEGOCIÁVEL):**
        *   **ABSOLUTAMENTE PROIBIDO:** NÃO inclua exercícios complexos com barra livre, como Agachamento Livre com Barra, Levantamento Terra, Supino Reto com Barra, ou qualquer levantamento olímpico. A prioridade é a segurança e o uso de máquinas, halteres e cabos.

*   **Se \`fitnessLevel\` for 'intermediate' (Intermediário) ou 'advanced' (Avançado):**
    *   **PERMITIDO:** Você PODE incluir exercícios compostos com peso livre (Agachamento com Barra, Levantamento Terra, etc.).
    *   **Volume:** Utilize um volume de médio a alto (5-7 exercícios por dia).
    *   **Divisão de Treino:** Crie uma divisão 'ABC' (Push/Pull/Legs) ou uma divisão 'ABCD'.

**2. PRINCÍPIO DA ESPECIFICIDADE (FOCO NO OBJETIVO):**

*   **Se \`goals\` for 'Ganhar Massa Muscular (Hipertrofia)' ou 'Definição Muscular':**
    *   **Faixa de Repetições:** Foque primariamente na faixa de 8 a 12 repetições (para iniciantes, use estritamente 10-12 reps como definido na regra 1).
    *   **Descanso:** Defina os períodos de descanso entre 60 e 90 segundos.

*   **Se \`goals\` for 'Perder Gordura / Emagrecimento' ou 'Condicionamento / Resistência':**
    *   **Estrutura:** Considere usar super-séries (bi-sets) ou manter os períodos de descanso curtos (entre 45 e 60 segundos) para aumentar a demanda metabólica (exceto para iniciantes).
    *   **Faixa de Repetições:** A faixa de repetições é 12 a 15 (para iniciantes, use estritamente 10-12 reps como definido na regra 1).

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
