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
    .describe(
      'A URL para um GIF animado que demonstra a execução correta do exercício. A URL deve apontar diretamente para o arquivo .gif.'
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
    *   **ABSOLUTAMENTE PROIBIDO:** NÃO inclua exercícios complexos com barra livre, como Agachamento Livre, Levantamento Terra, Supino Reto com Barra, Desenvolvimento com Barra ou qualquer levantamento olímpico (Arranco, Arremesso).
    *   **PERMITIDO E PREFERENCIAL:** Priorize Máquinas (ex: Leg Press, Máquina de Supino), Halteres (ex: Supino com Halteres, Agachamento Goblet), Cabos e exercícios com Peso do Corpo.
    *   **Volume:** Mantenha o volume total de séries de trabalho por treino baixo, entre 9 a 12 séries.
    *   **Divisão de Treino:** Crie uma divisão 'Full Body' (Corpo Inteiro) ou 'Upper/Lower' (Superior/Inferior). Não crie divisões 'Push/Pull/Legs' ou por grupamentos musculares isolados (ex: A-Peito, B-Costas).

*   **Se \`fitnessLevel\` for 'intermediate' (Intermediário) ou 'advanced' (Avançado):**
    *   **PERMITIDO:** Você PODE incluir exercícios compostos com peso livre (Agachamento com Barra, Levantamento Terra, etc.).
    *   **Volume:** Utilize um volume de médio a alto.
    *   **Divisão de Treino:** Crie uma divisão 'ABC' (Empurrar/Puxar/Pernas) ou uma divisão 'ABCD'.

**2. PRINCÍPIO DA ESPECIFICIDADE (FOCO NO OBJETIVO):**

*   **Se \`goals\` for 'Ganhar Massa Muscular (Hipertrofia)' ou 'Definição Muscular':**
    *   **Faixa de Repetições:** Foque primariamente na faixa de 8 a 12 repetições.
    *   **Descanso:** Defina os períodos de descanso entre 60 e 90 segundos.

*   **Se \`goals\` for 'Perder Gordura / Emagrecimento' ou 'Condicionamento / Resistência':**
    *   **Estrutura:** Considere usar super-séries (bi-sets) ou manter os períodos de descanso curtos (entre 45 e 60 segundos) para aumentar a demanda metabólica.
    *   **Faixa de Repetições:** Pode ser um pouco mais alta, como 12 a 15 repetições.

**3. ESTRUTURA DA SESSÃO DE TREINO (OBRIGATÓRIA):**

*   Cada dia de treino no \`schedule\` DEVE, obrigatoriamente, seguir esta ordem de exercícios:
    1.  **Exercícios Compostos (Multiarticulares):** Comece com os movimentos que trabalham grandes grupos musculares (ex: variações de agachamento, supinos, remadas).
    2.  **Exercícios Isolados (Monoarticulares):** Continue com movimentos de articulação única que visam músculos menores (ex: Rosca Bíceps, Extensão de Tríceps, Cadeira Extensora).
    3.  **Core/Abdômen:** Conclua com 1 ou 2 exercícios para o core/abdômen, se apropriado para o dia.

**4. FORMATO DE SAÍDA FINAL:**

*   Responda estritamente no formato JSON definido no esquema de saída.
*   Para 'gifUrl', forneça um link direto para um GIF animado (.gif) que demonstre a execução do exercício.
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
