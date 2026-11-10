import React from "react";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import {
  BannerSize,
  BANNER_SIZES,
  BannerThemeStyles,
  MatchBannerData,
} from "./types";
import { getInterFont } from "./fonts";
import { BUILT_IN_TEMPLATES } from "./templates";

export async function renderMatchBannerToPng(
  data: MatchBannerData,
  options: {
    templateId?: string;
    customTheme?: Partial<BannerThemeStyles>;
    size?: BannerSize;
  } = {}
): Promise<Buffer> {
  const {
    templateId = "modern-bold",
    customTheme = {},
    size = "SQUARE_1080x1080",
  } = options;

  const baseTheme = BUILT_IN_TEMPLATES[templateId] || BUILT_IN_TEMPLATES["modern-bold"];
  const theme: BannerThemeStyles = { ...baseTheme, ...customTheme };
  const dimensions = BANNER_SIZES[size] || BANNER_SIZES.SQUARE_1080x1080;

  const fontBuffer = await getInterFont();

  // Create JSX element for Satori
  const element = React.createElement(
    "div",
    {
      style: {
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "60px",
        background: theme.bgGradient,
        color: theme.textColor,
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box",
        position: "relative",
      },
    },
    // Top Bar: Tournament Name & Stage Badge
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            fontSize: "24px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: theme.primaryColor,
            fontWeight: "bold",
            marginBottom: "12px",
          },
        },
        data.tournamentName
      ),
      React.createElement(
        "div",
        {
          style: {
            padding: "8px 24px",
            borderRadius: "30px",
            background: theme.cardBg,
            border: `1px solid ${theme.primaryColor}55`,
            fontSize: "20px",
            color: theme.mutedTextColor,
            fontWeight: "600",
          },
        },
        data.groupName
          ? `${data.stageName} • ${data.groupName}`
          : `${data.stageName} • Matchday ${data.matchday || 1}`
      )
    ),

    // Middle: Teams vs Battle Area
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          width: "100%",
          justifyContent: "space-around",
          alignItems: "center",
          margin: "40px 0",
        },
      },
      // Home Team
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "360px",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              width: "140px",
              height: "140px",
              borderRadius: "70px",
              backgroundColor: data.homeTeam.primaryColor || theme.cardBg,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "44px",
              fontWeight: "900",
              color: "#ffffff",
              boxShadow: `0 0 30px ${data.homeTeam.primaryColor || theme.primaryColor}55`,
              marginBottom: "24px",
            },
          },
          data.homeTeam.shortName || data.homeTeam.name.slice(0, 3).toUpperCase()
        ),
        React.createElement(
          "div",
          {
            style: {
              fontSize: "36px",
              fontWeight: "800",
              textAlign: "center",
              textTransform: "uppercase",
              lineHeight: "1.2",
            },
          },
          data.homeTeam.name
        )
      ),

      // VS or Score Badge
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          },
        },
        data.result ? (
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                padding: "16px 36px",
                borderRadius: "20px",
                background: theme.cardBg,
                fontSize: "64px",
                fontWeight: "900",
                color: theme.accentColor,
              },
            },
            `${data.result.homeScore} - ${data.result.awayScore}`
          )
        ) : (
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  fontSize: "52px",
                  fontWeight: "900",
                  fontStyle: "italic",
                  color: theme.accentColor,
                },
              },
              "VS"
            )
          )
        )
      ),

      // Away Team
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "360px",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              width: "140px",
              height: "140px",
              borderRadius: "70px",
              backgroundColor: data.awayTeam.primaryColor || theme.cardBg,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "44px",
              fontWeight: "900",
              color: "#ffffff",
              boxShadow: `0 0 30px ${data.awayTeam.primaryColor || theme.primaryColor}55`,
              marginBottom: "24px",
            },
          },
          data.awayTeam.shortName || data.awayTeam.name.slice(0, 3).toUpperCase()
        ),
        React.createElement(
          "div",
          {
            style: {
              fontSize: "36px",
              fontWeight: "800",
              textAlign: "center",
              textTransform: "uppercase",
              lineHeight: "1.2",
            },
          },
          data.awayTeam.name
        )
      )
    ),

    // Bottom Footer: Date, Time & Venue
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          paddingTop: "24px",
          borderTop: `1px solid ${theme.cardBg}`,
        },
      },
      React.createElement(
        "div",
        {
          style: {
            fontSize: "28px",
            fontWeight: "700",
            color: theme.textColor,
            marginBottom: "8px",
          },
        },
        `${data.dateStr} • ${data.timeStr}`
      ),
      data.venueName &&
        React.createElement(
          "div",
          {
            style: {
              fontSize: "22px",
              color: theme.mutedTextColor,
            },
          },
          `📍 ${data.venueName}`
        )
    )
  );

  const svg = await satori(element as any, {
    width: dimensions.width,
    height: dimensions.height,
    fonts: [
      {
        name: "Inter",
        data: fontBuffer,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: dimensions.width,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
