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
    font-size: 1.1em;
    margin-top: 24px;
    padding-bottom: 0.2em;
    border-bottom: 1px solid #ddd;
  }

  & h1:first-of-type {
    margin-top: 5px;
  }
  & h2 {
    margin-top: 4px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  & h3 {
    font-size: 1.1em;
  }

  & ul {
    list-style: circle outside none;
    color: #333;
    padding-left: 1em;
  }

  & li {
    margin-left: 1.3em;
  }
`;
