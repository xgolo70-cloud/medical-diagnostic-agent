import { Composition } from 'remotion';
import { MacTerminal } from './MacTerminal';
import { Master } from './Master';
import { LogoCombo } from './LogoCombo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MacTerminal"
        component={MacTerminal}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={700}
      />
      <Composition
        id="Master"
        component={Master}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={700}
      />
      <Composition
        id="LogoCombo"
        component={LogoCombo}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={700}
      />
    </>
  );
};
