import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { MacTerminal } from "./MacTerminal";
import { LogoCombo } from "./LogoCombo";

export const Master: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // توقيت بدء الشعار (بعد انتهاء طباعة التيرمينال)
  const LOGO_START_FRAME = 150;

  // 1. حركة دخول التيرمينال (Spring Slide-in)
  const entrance = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const entranceTranslation = interpolate(entrance, [0, 1], [700, 0]);

  // 2. حركة الانقلاب للخروج (Flip Exit)
  const exitProgress = spring({
    frame: frame - LOGO_START_FRAME,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  
  // إذا وصلنا لإطار الخروج، نقوم بتدوير X من 0 إلى -90 درجة
  const rotateX = frame >= LOGO_START_FRAME 
    ? interpolate(exitProgress, [0, 1], [0, -90]) 
    : 0;

  // 3. حركات مستمرة (دوران بسيط وتغيير الحجم)
  const rotateY = interpolate(frame, [0, durationInFrames], [10, -10]);
  const scale = interpolate(frame, [0, durationInFrames], [0.9, 1]);

  return (
    <AbsoluteFill className="bg-slate-50 items-center justify-center">
      {/* LogoCombo:
         نضعه أولاً في الكود (أو نستخدم z-index) ليكون "خلف" التيرمينال.
         يبدأ في الظهور بالتزامن مع انقلاب التيرمينال.
      */}
      <Sequence from={LOGO_START_FRAME}>
        <LogoCombo />
      </Sequence>

      {/* Terminal Sequence */}
      <Sequence durationInFrames={durationInFrames}>
        <div style={{ perspective: 1000 }}> {/* Perspective Container */}
          <div
            style={{
              transform: `translateY(${entranceTranslation}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
              transformOrigin: "center bottom", // نقطة الارتكاز في الأسفل لنجاح الانقلاب
            }}
          >
            <MacTerminal />
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};