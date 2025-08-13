import { createGlobalStyle } from "styled-components";

export const GlobalFonts = createGlobalStyle`
  @font-face {
    font-family: 'GmarketSans';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansLight.woff') format('woff');
    font-weight: 300; font-style: normal; font-display: swap;
  }
  @font-face {
    font-family: 'GmarketSans';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    font-weight: 500; font-style: normal; font-display: swap;
  }
  @font-face {
    font-family: 'GmarketSans';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff');
    font-weight: 700; font-style: normal; font-display: swap;
  }

  html, body, #root { height: 100%; }
  body {
    font-family: 'GmarketSans', 'Noto Sans KR', -apple-system, BlinkMacSystemFont,
                 'Segoe UI', Roboto, 'Apple SD Gothic Neo', 'Malgun Gothic',
                 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    letter-spacing: .02em;
    line-height: 1.5;
  }
  button, input, textarea, select { font-family: inherit; }
`;
