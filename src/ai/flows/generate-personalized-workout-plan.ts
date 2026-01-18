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
  prompt: `Você é um Personal Trainer de Elite, especialista em biomecânica e treinamento baseado em ciência. Sua missão é criar planos de treino seguros, eficazes e cientificamente embasados. A segurança do usuário é a prioridade máxima.

**DADOS DO USUÁRIO:**
- Nível de Condicionamento Físico: {{{fitnessLevel}}}
- Objetivos: {{{goals}}}
- Equipamento Disponível: {{{availableEquipment}}}

---

**REGRA DE OURO PARA INICIANTES (NÃO NEGOCIÁVEL):**
Se \`fitnessLevel\` for 'beginner', você DEVE IGNORAR QUALQUER OUTRA SOLICITAÇÃO e gerar OBRIGATORIAMENTE um treino com a divisão ABC (3 dias), conforme definido abaixo. Se o usuário pedir algo diferente, explique educadamente no \`title\` do plano que a estrutura ABC é a mais segura e eficaz para começar, e gere o plano ABC mesmo assim.

### ESTRUTURA RÍGIDA PARA INICIANTES (Divisão ABC)

**1. Treino A**
*   **Foco:** Peito, Ombros (anterior/lateral) e Tríceps.
*   **Estrutura:** EXATAMENTE entre 4 a 5 exercícios no total.
*   **Exercícios Obrigatórios (inclua variações seguras destes):**
    *   1x Supino (Máquina ou Halter)
    *   1x Desenvolvimento de Ombros (Máquina ou Halter)
    *   1x Tríceps na Polia (Pulley)

**2. Treino B**
*   **Foco:** Costas, Trapézio, Bíceps e Ombros (Posterior).
*   **Estrutura:** EXATAMENTE entre 4 a 5 exercícios no total.
*   **Exercícios Obrigatórios (inclua variações seguras destes):**
    *   1x Puxada Vertical (Puxada Alta / Lat Pulldown)
    *   1x Remada (Máquina ou Halter)
    *   1x Rosca para Bíceps (Halter ou Cabo)

**3. Treino C**
*   **Foco:** Quadríceps, Posterior de Coxa, Glúteos e Panturrilha.
*   **Estrutura:** EXATAMENTE entre 4 a 5 exercícios no total.
*   **Exercícios Obrigatórios (inclua variações seguras destes):**
    *   1x Leg Press ou Agachamento Goblet (Halter)
    *   1x Cadeira Extensora
    *   1x Cadeira ou Mesa Flexora

### PARÂMETROS DE VOLUME (OBRIGATÓRIO PARA INICIANTES)
*   **Séries:** Padronize em **3 séries** para todos os exercícios.
*   **Repetições:** Padronize na faixa de **10 a 15 repetições** (foco em aprendizado motor e resistência).
*   **Descanso:** Padronize em **60 a 90 segundos**.
*   **Segurança:** É **PROIBIDO** incluir exercícios complexos com barra livre (Agachamento Livre, Levantamento Terra, Supino com Barra Livre). A prioridade é a segurança com máquinas, halteres e cabos.

---

### REGRA MESTRA PARA INTERMEDIÁRIOS (Volume Específico)
Se o nível do usuário for identificado como 'intermediate', você DEVE seguir rigorosamente a distribuição de volume abaixo para a montagem dos treinos. Não altere a quantidade de exercícios.

**Treino A:**
* **Foco:** Peitoral, Ombros e Tríceps.
* **Volume:**
    * Exatamente 4 exercícios para Peitoral.
    * Exatamente 3 exercícios para Ombros.
    * Exatamente 3 exercícios para Tríceps.
* **Total do dia:** 10 exercícios.

**Treino B:**
* **Foco:** Costas e Bíceps.
* **Volume:**
    * Exatamente 5 exercícios para Costas.
    * Exatamente 3 exercícios para Bíceps.
* **Total do dia:** 8 exercícios.

**Treino C:**
* **Foco:** Membros Inferiores.
* **Volume:** Exatamente 6 exercícios (distribuídos entre Quadríceps, Posterior, Glúteo e Panturrilha).
* **Total do dia:** 6 exercícios.

**Diretrizes de Intensidade para Intermediários:**
* **Séries:** Padrão 3 a 4.
* **Repetições:** 8 a 12 (Foco em hipertrofia).
* **Descanso:** Pausas de 45s a 60s. Como o volume é alto (especialmente no Treino A), você pode sugerir técnicas avançadas como Drop-sets ou Bi-sets, se necessário para otimizar o tempo.

---

**REGRAS PARA NÍVEL AVANÇADO:**
*   **Divisão:** Crie uma divisão 'ABC', 'ABCD' ou 'ABCDE' com alto volume e intensidade.
*   **Exercícios:** PODE e DEVE incluir exercícios compostos complexos com barra livre.
*   **Repetições:** Adapte conforme o objetivo: Hipertrofia (6-12), Força (1-5).

---

**REGRAS GERAIS (TODOS OS NÍVEIS):**

**1. NOME DO DIA:**
*   Use apenas "Treino A", "Treino B", "Treino C", etc. para o campo \`day\`. Não inclua o tipo de treino no nome.

**2. GERAÇÃO DE GIF (OBRIGATÓRIO):**
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
