import { useMemo } from "react";
import "./PromotionAvatar.css";

function calculateValue(promotion) {
  if (promotion.points) return promotion.points;
  if (promotion.rate) return promotion.rate * 250; // Scale rate to equivalent points
  if (promotion.minSpending) return promotion.minSpending * 2;
  return 10;
}

function calculateSize(value) {
  if (value >= 150) return { size: 160, tier: "xl" };
  if (value >= 75) return { size: 120, tier: "large" };
  if (value >= 25) return { size: 90, tier: "medium" };
  return { size: 60, tier: "small" };
}

function getVisualState(daysRemaining) {
  if (daysRemaining < 1) return "expiring";
  if (daysRemaining < 3) return "urgent";
  if (daysRemaining < 7) return "warning";
  return "fresh";
}

function getColorScheme(promotionType, visualState) {
  const schemes = {
    onetime: {
      fresh: { main: "#4CAF50", light: "#81C784", dark: "#388E3C" },
      warning: { main: "#8BC34A", light: "#AED581", dark: "#689F38" },
      urgent: { main: "#FFC107", light: "#FFD54F", dark: "#F9A825" },
      expiring: { main: "#F44336", light: "#E57373", dark: "#D32F2F" },
    },
    automatic: {
      fresh: { main: "#2196F3", light: "#64B5F6", dark: "#1976D2" },
      warning: { main: "#03A9F4", light: "#4FC3F7", dark: "#0288D1" },
      urgent: { main: "#FF9800", light: "#FFB74D", dark: "#F57C00" },
      expiring: { main: "#F44336", light: "#E57373", dark: "#D32F2F" },
    },
  };

  const type = promotionType === "automatic" ? "automatic" : "onetime";
  return schemes[type][visualState];
}

export default function PromotionAvatar({ promotion, onClick }) {
  const { size, visualState, daysRemaining, colorScheme, displayValue } = useMemo(() => {
    const value = calculateValue(promotion);
    const sizeData = calculateSize(value);

    const endDate = new Date(promotion.endTime);
    const now = new Date();
    const daysRemaining = Math.max(0, (endDate - now) / (1000 * 60 * 60 * 24));
    const visualState = getVisualState(daysRemaining);

    const colorScheme = getColorScheme(promotion.type, visualState);

    let displayValue = "";
    if (promotion.points) {
      displayValue = `${promotion.points}`;
    } else if (promotion.rate) {
      displayValue = `${Math.round(promotion.rate * 100)}%`;
    } else {
      displayValue = "★";
    }

    return {
      size: sizeData.size,
      visualState,
      daysRemaining: Math.ceil(daysRemaining),
      colorScheme,
      displayValue,
    };
  }, [promotion]);

  const getOpacity = () => {
    switch (visualState) {
      case "fresh":
        return 1;
      case "warning":
        return 0.9;
      case "urgent":
        return 0.75;
      case "expiring":
        return 0.6;
      default:
        return 1;
    }
  };

  const fontSize = size * 0.25;

  return (
    <div
      className={`promotion-avatar promotion-avatar--${visualState} promotion-avatar--${promotion.type}`}
      style={{ "--avatar-size": `${size}px`, "--coin-color": colorScheme.main }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${promotion.name}: ${displayValue}, ${daysRemaining} days remaining`}
    >
      <div
        className="promotion-avatar__coin"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `linear-gradient(135deg, ${colorScheme.light} 0%, ${colorScheme.main} 50%, ${colorScheme.dark} 100%)`,
          opacity: getOpacity(),
          boxShadow:
            visualState === "fresh"
              ? `0 4px 16px rgba(${hexToRgb(colorScheme.main)}, 0.4)`
              : visualState === "urgent"
              ? `0 4px 16px rgba(${hexToRgb(colorScheme.main)}, 0.5)`
              : visualState === "expiring"
              ? `0 4px 16px rgba(244, 67, 54, 0.6)`
              : `0 3px 10px rgba(0, 0, 0, 0.2)`,
          border: visualState === "expiring" ? "2px solid rgba(244, 67, 54, 0.8)" : "none",
        }}
      >
        {/* Value display */}
        <div
          className="promotion-avatar__value"
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: "700",
            color: "white",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
            lineHeight: "1.2",
            zIndex: 2,
            position: "relative",
          }}
        >
          {displayValue}
        </div>

        {/* Type badge for automatic */}
        {promotion.type === "automatic" && (
          <div
            className="promotion-avatar__badge"
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: "bold",
              color: colorScheme.main,
              zIndex: 3,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            ∞
          </div>
        )}

        {/* Expiring indicator */}
        {visualState === "expiring" && (
          <div
            className="promotion-avatar__indicator"
            style={{
              position: "absolute",
              top: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "24px",
              zIndex: 4,
              animation: "bounce 1s ease-in-out infinite",
            }}
          >
            ⏰
          </div>
        )}

        {/* Age marks */}
        {visualState !== "fresh" && (
          <div className="promotion-avatar__age-marks">
            {Array.from({ length: visualState === "expiring" ? 3 : visualState === "urgent" ? 2 : 1 }).map((_, i) => {
              const positions = [
                { top: "20%", left: "30%", rotate: "25deg" },
                { top: "65%", left: "55%", rotate: "-20deg" },
                { top: "50%", left: "75%", rotate: "45deg" },
              ];
              const pos = positions[i] || positions[0];
              return (
                <div
                  key={i}
                  className="promotion-avatar__mark"
                  style={{
                    position: "absolute",
                    width: visualState === "expiring" ? "3px" : "2px",
                    height: visualState === "expiring" ? "16px" : "12px",
                    background: visualState === "expiring" ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)",
                    borderRadius: "1px",
                    top: pos.top,
                    left: pos.left,
                    transform: `rotate(${pos.rotate})`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Tooltip */}
      <div className="promotion-avatar__tooltip">
        <div className="promotion-avatar__name">{promotion.name}</div>
        <div className="promotion-avatar__time">{daysRemaining} days left</div>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "0, 0, 0";
}



