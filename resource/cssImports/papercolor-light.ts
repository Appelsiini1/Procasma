/*!
  Theme: PaperColor Light
  Author: Jon Leopard (http://github.com/jonleopard) based on PaperColor Theme (https://github.com/NLKNguyen/papercolor-theme)
  License: ~ MIT (or more permissive) [via base16-schemes-source]
  Maintainer: @highlightjs/core-team
  Version: 2021.05.0

  Adapted and amended for Procasma by Rami Saarivuori
*/
export const css = `html {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  text-justify: inter-word;
}

h1 {
  font-size: 1.5em !important;
}

h2 {
  font-size: 1.17em !important;
}
h2.assig-title {
  font-size: 1.3em !important;
  margin-top: 1.2cm;
}
h3 {
  font-size: 1em !important;
}
h4 {
  font-size: 1em !important;
}
a.toc {
  text-decoration: none;
  color: black;
}
a {
  text-decoration: none;
}

code {
  background-color: rgb(235, 235, 235);
}
table {
  border-spacing: 10px 2px;
}
hr {
  border: 1px solid rgb(180, 180, 180);
  width: 100%;
  margin-top: 0.1cm;
}

img {
  max-width: 100%;
}

li {
  line-height: 1.0;
}

.container {
  width: 18cm;
  margin-top: 0.5cm;
}

.code-background {
  background: #eee;
  width: 18cm;
  margin-top: 0.5cm;
  padding-top: 1px;
  padding-bottom: 1px;
}
.code-inner-container {
  margin-left: 6px;
}

pre code.hljs {
  overflow-x: auto;
  font-size: 13px;
  background: #eee;
  text-justify: none;
  white-space: pre-wrap; 
}

.hljs {
  color: #444;
  width: 100%;
}
.hljs ::selection {
  color: #008700;
}
.hljs-comment {
  color: #5f8700;
}
.hljs-tag {
  color: #0087af;
}
.hljs-operator,
.hljs-punctuation,
.hljs-subst {
  color: #444;
}
.hljs-operator {
  opacity: 0.7;
}
.hljs-bullet,
.hljs-deletion,
.hljs-name,
.hljs-selector-tag,
.hljs-template-variable,
.hljs-variable {
  color: #bcbcbc;
}
.hljs-attr,
.hljs-link,
.hljs-literal,
.hljs-number,
.hljs-symbol,
.hljs-variable.constant_ {
  color: #d70000;
}
.hljs-class .hljs-title,
.hljs-title,
.hljs-title.class_ {
  color: #d70087;
}
.hljs-strong {
  font-weight: 700;
  color: #d70087;
}
.hljs-addition,
.hljs-code,
.hljs-string,
.hljs-title.class_.inherited__ {
  color: #8700af;
}
.hljs-attribute,
.hljs-built_in,
.hljs-doctag,
.hljs-function .hljs-title,
.hljs-keyword.hljs-atrule,
.hljs-quote,
.hljs-regexp,
.hljs-section,
.hljs-title.function_,
.ruby .hljs-property {
  color: #d75f00;
}
.diff .hljs-meta,
.hljs-keyword,
.hljs-template-tag,
.hljs-type {
  color: #005faf;
}
.hljs-emphasis {
  color: #005faf;
  font-style: italic;
}
.hljs-meta,
.hljs-meta .hljs-keyword,
.hljs-meta .hljs-string {
  color: #005f87;
}
.hljs-meta .hljs-keyword,
.hljs-meta-keyword {
  font-weight: 700;
}
`;
