/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cn from 'classnames';

import { memo, ReactNode, useEffect, useRef, useState } from 'react';
import { AudioRecorder } from '../../../lib/audio-recorder';
import { useSettings, useTools, useLogStore } from '@/lib/state';

import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';

export type ControlTrayProps = {
  children?: ReactNode;
};

function ControlTray({ children }: ControlTrayProps) {
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  const { client, connected, connect, disconnect } = useLiveAPIContext();

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);

  useEffect(() => {
    if (!connected) {
      setMuted(false);
      // Stop screen share if connection drops
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
    }
  }, [connected, screenStream]);

  // Audio Streaming Logic
  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64,
        },
      ]);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on('data', onData);
      audioRecorder.start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off('data', onData);
    };
  }, [connected, client, muted, audioRecorder]);

  // Screen Streaming Logic
  useEffect(() => {
    if (!connected || !screenStream || !videoRef.current) return;

    // Attach stream to video element for preview
    videoRef.current.srcObject = screenStream;
    videoRef.current.play();

    // Create a canvas to capture frames
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Capture and send frames at a steady interval (e.g., 2 FPS)
    const intervalId = setInterval(() => {
        if (videoRef.current && ctx) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            
            // Draw video frame to canvas
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            // Convert to base64 jpeg (0.6 quality to save bandwidth)
            const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
            
            client.sendRealtimeInput([
                {
                    mimeType: 'image/jpeg',
                    data: base64
                }
            ]);
        }
    }, 500); // 500ms = 2 FPS

    // Cleanup when stream ends or connection drops
    return () => {
        clearInterval(intervalId);
    };
  }, [connected, screenStream, client]);

  const handleMicClick = () => {
    if (connected) {
      setMuted(!muted);
    } else {
      connect();
    }
  };

  const handleScreenShareClick = async () => {
      if (screenStream) {
          // Stop sharing
          screenStream.getTracks().forEach(track => track.stop());
          setScreenStream(null);
      } else {
          try {
              // Start sharing
              const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
              setScreenStream(stream);
              
              // Handle user stopping stream via browser UI
              stream.getVideoTracks()[0].onended = () => {
                  setScreenStream(null);
              };
          } catch (e) {
              console.error("Error sharing screen:", e);
          }
      }
  };

  const handleExportLogs = () => {
    const { systemPrompt, model } = useSettings.getState();
    const { tools } = useTools.getState();
    const { turns } = useLogStore.getState();

    const logData = {
      configuration: {
        model,
        systemPrompt,
      },
      tools,
      conversation: turns.map(turn => ({
        ...turn,
        // Convert Date object to ISO string for JSON serialization
        timestamp: turn.timestamp.toISOString(),
      })),
    };

    const jsonString = JSON.stringify(logData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `live-api-logs-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const micButtonTitle = connected
    ? muted
      ? 'Desmutar microfone'
      : 'Mutar microfone'
    : 'Conectar e iniciar microfone';

  const connectButtonTitle = connected ? 'Parar streaming' : 'Iniciar streaming';
  const screenShareTitle = screenStream ? 'Parar compartilhamento' : 'Compartilhar tela';

  return (
    <section className="control-tray">
      {/* Floating Video Preview */}
      <video
        ref={videoRef}
        className={cn("screen-share-preview", { hidden: !screenStream })}
        autoPlay
        playsInline
        muted // Mute locally to avoid feedback loops if system audio is shared
      />

      <nav className={cn('actions-nav')}>
        <button
          className={cn('action-button mic-button')}
          onClick={handleMicClick}
          title={micButtonTitle}
        >
          {!muted ? (
            <span className="material-symbols-outlined filled">mic</span>
          ) : (
            <span className="material-symbols-outlined filled">mic_off</span>
          )}
        </button>

        <button
          className={cn('action-button', { active: !!screenStream })}
          onClick={handleScreenShareClick}
          title={screenShareTitle}
          disabled={!connected}
        >
          <span className="material-symbols-outlined filled">
            {screenStream ? 'stop_screen_share' : 'present_to_all'}
          </span>
        </button>

        <button
          className={cn('action-button')}
          onClick={handleExportLogs}
          aria-label="Exportar Logs"
          title="Exportar logs da sessão"
        >
          <span className="icon">download</span>
        </button>
        <button
          className={cn('action-button')}
          onClick={useLogStore.getState().clearTurns}
          aria-label="Reiniciar Chat"
          title="Reiniciar logs da sessão"
        >
          <span className="icon">refresh</span>
        </button>
        {children}
      </nav>

      <div className={cn('connection-container', { connected })}>
        <div className="connection-button-container">
          <button
            ref={connectButtonRef}
            className={cn('action-button connect-toggle', { connected })}
            onClick={connected ? disconnect : connect}
            title={connectButtonTitle}
          >
            <span className="material-symbols-outlined filled">
              {connected ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>
        <span className="text-indicator">Transmitindo</span>
      </div>
    </section>
  );
}

export default memo(ControlTray);
