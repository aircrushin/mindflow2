import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Heart, RefreshCw, Check, LogIn, Download, Share2, Link, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSaveSession } from "@/hooks/useCBTHistory";
import { CBTSessionState } from "@/types/cbt";
import { ShareCard } from "./ShareCard";
import { toast } from "sonner";

interface CompletionCelebrationProps {
  onReset: () => void;
  sessionData: CBTSessionState;
}

const encouragements = [
  "你做得很棒！✨",
  "每一步都是进步 💪",
  "感谢你照顾自己的情绪 💝",
  "你比想象中更坚强 🌟",
  "这份努力值得被看见 🌈",
];

export function CompletionCelebration({ onReset, sessionData }: CompletionCelebrationProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveSession, isLoggedIn } = useSaveSession();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const hasSaved = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareCard, setShowShareCard] = useState(true);

  const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

  // Save session on mount if logged in
  useEffect(() => {
    if (isLoggedIn && !hasSaved.current) {
      hasSaved.current = true;
      setSaving(true);
      saveSession({
        customEmotion: sessionData.customEmotion,
        selectedEmotion: sessionData.selectedEmotion,
        emotionIntensity: sessionData.emotionIntensity,
        bodySensation: sessionData.bodySensation,
        automaticThought: sessionData.automaticThought,
        detectedDistortions: sessionData.detectedDistortions,
        aiQuestions: sessionData.aiQuestions,
        balancedThought: sessionData.balancedThought,
        selectedAction: sessionData.selectedAction,
      }).then(({ error }) => {
        setSaving(false);
        if (!error) {
          setSaved(true);
        }
      });
    }
  }, [isLoggedIn, saveSession, sessionData]);

  useEffect(() => {
    // 轻柔的 confetti 效果
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const colors = ["#C5B9E0", "#B8D4E3", "#9CAF88", "#FFD700"];

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        gravity: 0.8,
        scalar: 0.8,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        gravity: 0.8,
        scalar: 0.8,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  // 下载图片
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#FAF9F6",
      });

      const link = document.createElement("a");
      link.download = `mindflow-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("图片已保存");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("保存失败，请重试");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  // 复制分享链接
  const handleCopyLink = useCallback(async () => {
    const shareUrl = "https://mindflow2.lovable.app";
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("链接已复制");
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("链接已复制");
    }
  }, []);

  // 原生分享
  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MINDFLOW 情绪急救",
          text: "我刚刚完成了一次情绪急救练习，推荐你也试试！",
          url: "https://mind.lucids.top",
        });
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  }, [handleCopyLink]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center space-y-6 py-4"
    >
      {/* 分享卡片展示 */}
      {showShareCard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="flex justify-center overflow-hidden">
            <div className="transform scale-[0.85] origin-top">
              <ShareCard ref={cardRef} sessionData={sessionData} />
            </div>
          </div>

          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-3 mt-4"
          >
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="rounded-2xl bg-sage hover:bg-sage/90 text-sage-foreground"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-sage-foreground border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              保存图片
            </Button>
            <Button
              onClick={handleNativeShare}
              variant="outline"
              className="rounded-2xl border-lavender hover:bg-lavender/10"
            >
              <Share2 className="mr-2 h-4 w-4" />
              分享
            </Button>
            <Button onClick={handleCopyLink} variant="ghost" size="icon" className="rounded-xl">
              <Link className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* 鼓励语 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-5 h-5 text-lavender fill-lavender/50" />
          <h2 className="text-xl font-semibold text-foreground">情绪急救完成！</h2>
        </div>
        <p className="text-lavender">{randomEncouragement}</p>
      </motion.div>

      {/* Save status */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        {isLoggedIn ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-sage border-t-transparent rounded-full animate-spin" />
                <span>保存中...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 text-sage" />
                <span className="text-sage">已保存到历史记录</span>
              </>
            ) : null}
          </div>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>登录后可保存记录</span>
          </button>
        )}
      </motion.div>

      {/* 底部按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
      >
        <Button
          onClick={onReset}
          variant="outline"
          className="rounded-2xl px-6 h-12 border-lavender/30 hover:bg-lavender/10"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          开始新的练习
        </Button>
        {isLoggedIn && (
          <Button onClick={() => navigate("/history")} variant="ghost" className="rounded-2xl px-6 h-12">
            查看历史记录
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
