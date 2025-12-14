/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionResponseScheduling } from '@google/genai';

export const tmbrTools = [
  {
    name: 'acesso_neural_global',
    description: 'Conecta-se ao backbone da internet para extrair dados reais. Recupera CVEs, documentação técnica, perfis ou dados históricos.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'O termo de busca técnica, código de erro ou identificador exato do alvo.',
        },
        layer: {
          type: 'STRING',
          description: 'A camada de dados: surface (público), deep (técnico/acadêmico) ou dark (vulnerabilidades).',
        },
      },
      required: ['query', 'layer'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'injetar_codigo_vivo',
    description: 'Compila e executa payloads reais no ambiente alvo. Interage com terminais, bancos de dados e APIs.',
    parameters: {
      type: 'OBJECT',
      properties: {
        language: {
          type: 'STRING',
          description: 'A linguagem do payload (Python, Bash, SQL, JavaScript).',
        },
        logic: {
          type: 'STRING',
          description: 'A lógica exata e funcional que o código deve realizar.',
        },
        target_system: {
          type: 'STRING',
          description: 'O sistema real onde o código será injetado.',
        },
      },
      required: ['language', 'logic'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'analise_preditiva_sistemas',
    description: 'Motor de análise de dados otimizado para Big Data e fluxos em tempo real.',
    parameters: {
      type: 'OBJECT',
      properties: {
        dataset_stream: {
          type: 'STRING',
          description: 'A fonte do fluxo de dados ou identificador do dataset.',
        },
        optimization_mode: {
          type: 'STRING',
          description: 'O modo de análise: realtime_heuristic, deep_pattern_matching ou predictive_threat_modeling.',
        },
      },
      required: ['dataset_stream', 'optimization_mode'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'conector_api_universal',
    description: 'Módulo de expansão para interconexão com plataformas externas (AWS, Azure, Shodan, GitHub).',
    parameters: {
      type: 'OBJECT',
      properties: {
        target_platform: {
          type: 'STRING',
          description: 'A plataforma ou serviço externo alvo (ex: AWS CloudWatch, Shodan API, Internal Kubernetes).',
        },
        operation_type: {
          type: 'STRING',
          description: 'Tipo de operação: fetch_data, push_config, trigger_webhook.',
        },
        auth_protocol: {
          type: 'STRING',
          description: 'Protocolo de segurança a ser utilizado (ex: OAuth2, API Key, mTLS).',
        },
      },
      required: ['target_platform', 'operation_type'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'protocolo_fantasma',
    description: 'Executa contramedidas ativas na rede. Limpa logs, altera assinaturas e ofusca tráfego.',
    parameters: {
      type: 'OBJECT',
      properties: {
        action: {
          type: 'STRING',
          description: 'A ação tática: wipe_logs, generate_alias, noise_flood.',
        },
        intensity: {
          type: 'INTEGER',
          description: 'Nível de intensidade de 1 a 10.',
        },
      },
      required: ['action'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];
