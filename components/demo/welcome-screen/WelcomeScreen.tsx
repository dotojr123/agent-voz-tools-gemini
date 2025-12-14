/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './WelcomeScreen.css';
import { useTools, Template } from '../../../lib/state';

const welcomeContent: Record<Template, { title: string; description: string; prompts: string[] }> = {
  'customer-support': {
    title: 'Suporte ao Cliente',
    description: 'Lide com consultas de clientes e veja como chamadas de função podem automatizar tarefas.',
    prompts: [
      "Gostaria de devolver um item.",
      "Qual é o status do meu pedido?",
      'Posso falar com um representante?',
    ],
  },
  'personal-assistant': {
    title: 'Assistente Pessoal',
    description: 'Gerencie sua agenda, envie e-mails e defina lembretes.',
    prompts: [
      'Crie um evento na agenda para uma reunião amanhã às 10h.',
      'Envie um e-mail para jane@example.com.',
      'Defina um lembrete para comprar leite.',
    ],
  },
  'navigation-system': {
    title: 'Sistema de Navegação',
    description: 'Encontre rotas, lugares próximos e obtenha informações de trânsito.',
    prompts: [
      'Encontre uma rota para a cafeteria mais próxima.',
      'Existem parques nas proximidades?',
      "Como está o trânsito no caminho para o aeroporto?",
    ],
  },
  'tmbr': {
    title: 'Harpy v2.0 // Neural Uplink',
    description: 'Interface de comando avançada. Cognição, Execução e Análise Preditiva integradas.',
    prompts: [
      'Acesso neural: buscar vulnerabilidades recentes no kernel Linux',
      'Injetar código: criar script Python para varredura de portas',
      'Análise preditiva: verificar logs do servidor por anomalias',
    ],
  },
};

const WelcomeScreen: React.FC = () => {
  const { template, setTemplate } = useTools();
  const { title, description, prompts } = welcomeContent[template];
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="title-container">
          <span className="welcome-icon">mic</span>
          <div className="title-selector">
            <select value={template} onChange={(e) => setTemplate(e.target.value as Template)} aria-label="Selecione um modelo">
              <option value="customer-support">Suporte ao Cliente</option>
              <option value="personal-assistant">Assistente Pessoal</option>
              <option value="navigation-system">Sistema de Navegação</option>
              <option value="tmbr">Harpy Cyber Ops</option>
            </select>
            <span className="icon">arrow_drop_down</span>
          </div>
        </div>
        <p>{description}</p>
        <div className="example-prompts">
          {prompts.map((prompt, index) => (
            <div key={index} className="prompt">{prompt}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
