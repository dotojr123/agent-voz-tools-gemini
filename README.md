# Gemini Live API - Native Audio & Function Calling Sandbox

![License](https://img.shields.io/badge/license-Apache_2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Gemini](https://img.shields.io/badge/Google-Gemini_Multimodal_Live_API-8E75B2)

Este repositório contém uma implementação de referência (Sandbox) para a **Google Gemini Multimodal Live API**. O projeto demonstra uma arquitetura de baixa latência para streaming de áudio bidirecional (Full Duplex) e execução de ferramentas (Function Calling) em tempo real via WebSocket.

O sistema opera inteiramente no navegador, gerenciando buffers de áudio PCM brutos, VAD (Voice Activity Detection) e injeção de contexto multimodal.

## 🏗 Arquitetura do Sistema

O projeto utiliza uma arquitetura orientada a eventos para gerenciar o fluxo de dados em tempo real:

### 1. Core de Comunicação (`lib/genai-live-client.ts`)
- Interface direta com o SDK `@google/genai` via WebSocket.
- Gerencia o handshake de sessão, envio de frames de mídia e recepção de turnos do modelo.
- Emite eventos tipados (`audio`, `content`, `toolcall`) para a camada de UI.

### 2. Processamento de Áudio (`lib/audio-streamer.ts` & `lib/audio-recorder.ts`)
- **Audio Worklets**: O processamento de áudio ocorre fora da thread principal para evitar latência e "picotes" na UI.
- **Input (Microfone)**: Captura raw PCM (16kHz), converte float32 para int16 e envia via buffer para o socket.
- **Output (Speaker)**: Recebe chunks de áudio do modelo, enfileira e gerencia o playback suave (gapless playback) com compensação de drift.

### 3. Gerenciamento de Estado (`lib/state.ts`)
- Utiliza **Zustand** para gerenciamento de estado global leve.
- Armazena logs de turnos, configuração de ferramentas ativas e prompts de sistema.

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- Chave de API do Google Gemini (obtenha em [Google AI Studio](https://aistudio.google.com/))

### Setup

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure a Chave de API:**
   Crie um arquivo `.env` na raiz ou exporte a variável no seu ambiente:
   ```bash
   export REACT_APP_GEMINI_API_KEY="sua-chave-api-aqui"
   ```
   *Nota: No ambiente de desenvolvimento (Vite), a variável deve ser acessível via `process.env` ou `import.meta.env` conforme configurado no bundler.*

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🛠 Stack Tecnológico

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Linguagem**: TypeScript
- **Styling**: CSS Modules / Variáveis CSS nativas
- **Áudio**: Web Audio API (AudioWorklets)
- **SDK**: `@google/genai`

## 📦 Estrutura de Pastas

```
/src
  /components     # Componentes React (UI)
  /contexts       # Context API (LiveAPIContext)
  /hooks          # Hooks customizados (useLiveApi)
  /lib            # Lógica Core (não-UI)
    /tools        # Definições de Ferramentas (Schemas JSON)
    /worklets     # Processadores de áudio (Threads separadas)
  /docs           # Documentação técnica avançada
```

## 📄 Licença

Distribuído sob a licença Apache 2.0. Veja `LICENSE` para mais informações.
