import React from 'react';
import { Global, css } from '@emotion/react';

const GlobalCSS = () => (
  <Global
    styles={css`
      * {
        margin: 0;
        padding: 0;
        user-select: none;
        box-sizing: border-box;
        outline: none;
      }
      a:link,
      a:visited {
        text-decoration: none;
        padding: 4px;
      }
      input,
      input:focus {
        border: none;
      }
      body {
        font-family: Roboto, sans-serif;
      }
      button,
      input {
        border: 0;
        padding: 0;
        outline: none;
        border: none;
      }
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        box-shadow: 0 0 0 30px white inset !important;
        -webkit-box-shadow: 0 0 0 30px white inset !important;
      }
    `}
  />
);

export { GlobalCSS };
