# Guia de Implementação: Conexões Externas e Ferramentas Reais

Este documento detalha como estender a capacidade da Harpy (e do Sandbox em geral) para interagir com o mundo real. **Não há simulação aqui.** Descrevemos a arquitetura para fazer chamadas HTTP reais, interagir com bancos de dados e conectar a serviços externos.

> **⚠️ Importante:** Como esta aplicação roda no navegador (Client-Side), conexões diretas a bancos de dados (Postgres, Redis) ou protocolos TCP brutos **não são possíveis** devido a restrições de segurança do browser (Sandbox/CORS).
>
> **A Solução Profissional:** Utilize o padrão **Browser-to-API**. O navegador atua como orquestrador, chamando APIs REST/GraphQL ou Servidores Intermediários que executam a ação pesada.

---

## O Fluxo de Execução de Ferramentas (The Loop)

1. **Definição**: Você define um Schema JSON que ensina ao modelo o que a ferramenta faz.
2. **Invocação**: O Gemini decide chamar a ferramenta e envia um evento `toolcall` via WebSocket.
3. **Execução (Seu Código)**: O cliente intercepta o evento, executa código JavaScript/TypeScript real (fetch, cálculo, etc.).
4. **Resposta**: O cliente envia o resultado de volta ao modelo via `sendToolResponse`.

---

## Passo 1: Definir a Ferramenta

Crie ou edite um arquivo em `src/lib/tools/`. Exemplo: `src/lib/tools/real-integration.ts`.

```typescript
import { FunctionResponseScheduling } from '@google/genai';
import { FunctionCall } from '../state';

export const realWorldTools: FunctionCall[] = [
  {
    name: 'consultar_clima_real',
    description: 'Consulta a API meteorológica oficial em tempo real.',
    parameters: {
      type: 'OBJECT',
      properties: {
        latitude: { type: 'NUMBER' },
        longitude: { type: 'NUMBER' },
      },
      required: ['latitude', 'longitude'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT, // O modelo espera a resposta antes de falar
  },
  {
    name: 'executar_pipeline_ci',
    description: 'Dispara um workflow real no GitHub Actions.',
    parameters: {
      type: 'OBJECT',
      properties: {
        repo: { type: 'STRING' },
        branch: { type: 'STRING' },
      },
      required: ['repo', 'branch'],
    },
    isEnabled: true,
  }
];
```

---

## Passo 2: Registrar a Ferramenta

No arquivo `src/lib/state.ts`, adicione suas novas ferramentas à lista ou template desejado.

```typescript
import { realWorldTools } from './tools/real-integration';

// ...
const toolsets: Record<Template, FunctionCall[]> = {
  // ...
  'tmbr': [...tmbrTools, ...realWorldTools], // Adiciona ao perfil Harpy
};
```

---

## Passo 3: Implementar a Lógica de Execução (O Código Real)

A mágica acontece em `src/hooks/media/use-live-api.ts`. É aqui que você substitui o "mock" por chamadas reais.

Localize o ouvinte `client.on('toolcall', ...)` e implemente seu switch case.

### Exemplo de Implementação Profissional

```typescript
// src/hooks/media/use-live-api.ts

// ... dentro do useEffect ...

const onToolCall = async (toolCall: LiveServerToolCall) => {
  const functionResponses: any[] = [];

  // Log da solicitação do modelo
  console.log('Modelo solicitou execução:', toolCall);

  for (const fc of toolCall.functionCalls) {
    let result: any = { error: 'Ferramenta desconhecida' };

    try {
      // --- INTERAÇÃO COM API PÚBLICA REAL ---
      if (fc.name === 'consultar_clima_real') {
        const { latitude, longitude } = fc.args as any;
        
        // Chamada HTTP real (fetch)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?lat=${latitude}&long=${longitude}&current_weather=true`
        );
        const data = await response.json();
        
        result = { 
          temperatura: data.current_weather.temperature,
          unidade: 'Celsius',
          condicao: data.current_weather.weathercode 
        };
      }

      // --- INTERAÇÃO COM BACKEND SEGURO (MÉTODO RECOMENDADO) ---
      else if (fc.name === 'executar_pipeline_ci') {
        // NÃO coloque tokens GitHub no frontend.
        // Chame seu próprio backend proxy que guarda os segredos.
        
        const response = await fetch('https://api.seubackend.com/trigger-pipeline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}` // Token do usuário logado
          },
          body: JSON.stringify(fc.args)
        });
        
        result = await response.json();
      }
      
      // --- MANTENDO O PADRÃO PARA OUTRAS FERRAMENTAS ---
      else {
        // Fallback ou lógica padrão
        result = { result: 'ok', detail: 'Execução manual necessária' };
      }

    } catch (e) {
      console.error(`Falha na execução da ferramenta ${fc.name}:`, e);
      result = { error: 'Falha na execução externa', details: e.message };
    }

    // Adiciona a resposta à fila
    functionResponses.push({
      id: fc.id,
      name: fc.name,
      response: result, 
    });
  }

  // Envia os dados reais de volta para o Gemini processar
  client.sendToolResponse({ functionResponses });
};
```

---

## Melhores Práticas de Segurança (Dezembro 2025)

1.  **Nunca exponha chaves de API sensíveis no Frontend**: Se a ferramenta precisa de uma chave privada (ex: AWS Secret Key, GitHub Token de escrita), a Harpy deve chamar um Endpoint do seu backend (Next.js API Routes, Express, Python FastAPI), e esse backend faz a chamada final.
2.  **Validação de Input**: O modelo pode alucinar parâmetros. Sempre valide `fc.args` antes de passar para `fetch`.
3.  **Timeouts**: A Live API é tempo real. Se sua API demorar > 5 segundos, o modelo pode perder o contexto. Implemente timeouts nos seus `fetch`.
4.  **Feedback Visual**: Ao executar uma ação real (como "Deletar Arquivo"), considere emitir um evento para a UI pedir confirmação ao usuário antes de o código prosseguir, ou mostre um "loading" na interface.

## Conclusão

Este sandbox não é um brinquedo simulado. Ele é um **Cliente de Orquestração**. O poder dele é limitado apenas pelas APIs que você conectar no arquivo `use-live-api.ts`.
