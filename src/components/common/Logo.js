/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';

const siteTitle = (theme) =>
  css({
    fontSize: '18px',
    fontWeight: 700,

    'span: nth-of-type(1)': {
      color: theme.colors.red,
    },
    'span: nth-of-type(2)': {
      color: theme.colors.lightblue,
    },
    'span: nth-of-type(3)': {
      color: theme.colors.green,
    },
  });

function Logo() {
  return (
    <h1 css={siteTitle}>
      <span>A</span>
      <span>m</span>
      <span>y </span>
      Rodriguez CMS
    </h1>
  );
}

export default Logo;
