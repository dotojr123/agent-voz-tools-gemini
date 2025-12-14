/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useUI } from '@/lib/state';

export default function Header() {
  const { toggleSidebar } = useUI();

  return (
    <header>
      <div className="header-left">
        <h1>Sandbox de Chamada de Função de Áudio Nativo</h1>
        <p>Copie o app e peça ao Code Assistant para adicionar chamadas de função.</p>
        <p>Crie seu próprio experimento.</p>
      </div>
      <div className="header-right">
        <button
          className="settings-button"
          onClick={toggleSidebar}
          aria-label="Configurações"
        >
          <span className="icon">tune</span>
        </button>
      </div>
    </header>
  );
}
