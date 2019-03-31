import { createGlobalStyle } from 'styled-components/macro';
import { getTheme } from './themes.js';

import 'font-awesome/css/font-awesome.css';
import 'react-select/dist/react-select.css';

const t = getTheme();

export { Normalize } from 'styled-normalize';

export const GlobalStyle = createGlobalStyle`
html *,
div,
span
{
    font-size: 14px;
}
body {
  margin: 0;
  padding: 0;
}
.vs-application-layout-content a {
  text-decoration: none;
  cursor: pointer;
  color: ${t.a.color};
  border-bottom: ${t.a.borderBottom};
}
.vs-application-layout-content a:hover {
  color: ${t.aHover.color};
  text-decoration: none;
  border-bottom: ${t.aHover.borderBottom};
}


/********** vs-overrides / sorry */

::selection {
  background-color: #ddd;
  color: #000;
}

.vs-page-content.vs-page-content {
  padding: 16px;
}

.vs-sidenav a:focus svg, .vs-sidenav .expanded > a.vs-sidenav-container-row svg {
  fill: #fed78f !important;
}

.vs-sidenav-container-row,
.vs-sideNav-left-logo {
  background: #e06c6b !important;
}

body, p, td, th, h1, h2, h3, h4, h5 {
}
`;
