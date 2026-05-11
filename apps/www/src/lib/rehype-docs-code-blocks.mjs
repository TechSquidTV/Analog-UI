const terminalLanguages = new Set(['bash', 'console', 'sh', 'shell', 'terminal', 'zsh']);

function getClassNames(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  return [];
}

function findCodeLanguage(node) {
  if (!node || typeof node !== 'object') return undefined;

  if (node.type === 'element' && node.tagName === 'code') {
    const className = getClassNames(node.properties?.className);
    const languageClass = className.find((name) => name.startsWith('language-'));
    return languageClass?.slice('language-'.length);
  }

  for (const child of node.children ?? []) {
    const language = findCodeLanguage(child);
    if (language) return language;
  }

  return undefined;
}

function makeElement(tagName, properties, children = []) {
  return {
    type: 'element',
    tagName,
    properties,
    children,
  };
}

function makeText(value) {
  return {
    type: 'text',
    value,
  };
}

function wrapCodeBlock(preNode) {
  const language = findCodeLanguage(preNode);
  const label = terminalLanguages.has(language ?? '') ? 'Terminal' : 'Code';

  return makeElement(
    'div',
    {
      className: [
        'not-prose',
        'docs-code-block',
        'docs-code-block--framed',
        'docs-code-block--markdown',
      ],
      dataDocsCopyRoot: '',
    },
    [
      makeElement('div', { className: ['docs-code-header'] }, [
        makeElement('span', { className: ['micro-label'] }, [makeText(label)]),
      ]),
      makeElement(
        'div',
        {
          className: ['docs-code-body'],
          dataDocsCode: '',
        },
        [preNode],
      ),
    ],
  );
}

function transformChildren(node, insideDocsCodeBlock = false) {
  if (!node || !Array.isArray(node.children)) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];
    const isDocsCodeBlock =
      child.type === 'element' &&
      getClassNames(child.properties?.className).includes('docs-code-block');
    const isPre = child.type === 'element' && child.tagName === 'pre';

    if (isPre && !insideDocsCodeBlock) {
      node.children[index] = wrapCodeBlock(child);
      continue;
    }

    transformChildren(child, insideDocsCodeBlock || isDocsCodeBlock);
  }
}

export default function rehypeDocsCodeBlocks() {
  return (tree) => {
    transformChildren(tree);
  };
}
