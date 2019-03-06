import styled from 'styled-components/macro';
import ReactMarkdown from 'react-markdown';

export const Markdown = styled(ReactMarkdown)`
  border: 0px solid #eee;
  margin-bottom: 5px;
  padding: 0.5em;

  & * {
    font-size: 1em;
  }

  & h1 {
    font-size: 1.6em;
    margin-top: 24px;
    padding-bottom: 0.2em;
    border-bottom: 1px solid #ddd;
    font-variant: all-small-caps;
  }

  & h1:first-of-type {
    margin-top: 5px;
  }
  & h2 {
    font-size: 1.4em;
    margin-top: 10px;
    font-variant: all-small-caps;
  }
  & h3 {
    font-size: 1.2em;
  }

  & ul {
    list-style: circle outside none;
    color: #333;
  }

  & li {
    margin-left: 1.3em;
  }
`;
