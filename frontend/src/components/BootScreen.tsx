import { useEffect, useMemo, useState } from 'react';
import type { PlayerProfile } from '../types';

interface BootScreenProps {
  onComplete: (profile: PlayerProfile) => void;
}

const bootLines = [
  'Соединяемся с серверами MF.Game...',
  'Проверяем игровой профиль...',
  'Синхронизируем карту мира...',
  'Открываем стратегический канал...',
];

export function BootScreen({ onComplete }: BootScreenProps) {
  const [step, setStep] = useState(0);
  const nickname = useMemo(() => `Gamer${Math.floor(1000 + Math.random() * 8999)}`, []);

  useEffect(() => {
    if (step >= bootLines.length) {
      const timeoutId = window.setTimeout(() => {
        onComplete({
          id: crypto.randomUUID(),
          nickname,
          role: 'king',
        });
      }, 500);

      return () => window.clearTimeout(timeoutId);
    }

    const timeoutId = window.setTimeout(() => setStep((value) => value + 1), 650);
    return () => window.clearTimeout(timeoutId);
  }, [nickname, onComplete, step]);

  return (
    <div className="boot-screen">
      <div className="boot-card">
        <div className="boot-logo">MF.Game</div>
        <div className="boot-subtitle">browser grand strategy network</div>

        <div className="boot-progress">
          {bootLines.map((line, index) => (
            <div className={index <= step ? 'boot-line boot-line-active' : 'boot-line'} key={line}>
              <span>{index < step ? '✓' : index === step ? '…' : ' '}</span>
              {line}
            </div>
          ))}
        </div>

        <div className="boot-user">Добро пожаловать, {nickname}</div>
      </div>
    </div>
  );
}
