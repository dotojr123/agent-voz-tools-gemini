/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './PopUp.css';

interface PopUpProps {
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Bem-vindo ao Sandbox de Funções de Áudio Nativo</h2>
        <p>Seu ponto de partida para criar com áudio nativo e chamadas de função.</p>
        <p>Para começar:</p>
        <ol>
          <li><span className="icon">play_circle</span>Pressione Play para iniciar o streaming de áudio.</li>
          <li><span className="icon">save_as</span>Copie este sandbox para criar sua própria versão.</li>
          <li><span className="icon">auto_awesome</span>Use o Assistente de Código para personalizar e testar sua criação.</li>
        </ol>
        <button onClick={onClose}>Começar a Criar</button>
      </div>
    </div>
  );
};

export default PopUp;
