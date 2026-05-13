import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const RAW_FINISH_PATTERNS = [
  {
    pattern: /\brgba\s*\(/gi,
    message:
      'Use Analog highlight/shadow channels instead of raw rgba(). Prefer rgb(var(--analog-highlight-rgb) / alpha) or rgb(var(--analog-shadow-rgb) / alpha).',
  },
  {
    pattern:
      /\brgb\s*\(\s*(?:0\s*,\s*0\s*,\s*0|255\s*,\s*255\s*,\s*255|0\s+0\s+0|255\s+255\s+255)\b/gi,
    message: 'Use Analog highlight/shadow channels instead of raw neutral rgb() colors.',
  },
  {
    pattern: /#[0-9a-f]{3,8}\b/gi,
    message: 'Use theme or Analog tokens instead of hex color literals in component finish styles.',
  },
  {
    pattern: /\b(?:fill|stroke|floodColor|stopColor)=["'](?:black|white)["']/g,
    message: 'Use Analog SVG color tokens instead of direct black/white SVG attributes.',
  },
  {
    pattern:
      /(?:^|[\s"'`{])(?:bg|text|border|ring|fill|stroke|from|via|to|shadow|outline|decoration)-(?:black|white)(?:\b|\/|\]|\s|["'`})])/g,
    message:
      'Use theme or Analog token utilities instead of direct black/white Tailwind color utilities.',
  },
  {
    pattern:
      /\b(?:shadow|drop-shadow|filter)-\[[^\]\n]*(?:rgba\(|#[0-9a-f]{3,8}|\b(?:black|white)\b)[^\]\n]*\]/gi,
    message: 'Use Analog shadow tokens instead of raw colors inside arbitrary shadow utilities.',
  },
];

const CSS_ONLY_PATTERNS = [
  {
    pattern:
      /(?:^|[;{\n]\s*)(?:background(?:-color)?|color|border(?:-color)?|box-shadow|text-shadow|fill|stroke)\s*:\s*(?:black|white)\b/gim,
    message: 'Use theme or Analog tokens instead of direct black/white CSS declarations.',
  },
];

const ANALOG_TOKEN_REFERENCE_PATTERN = /var\(\s*(--analog-[A-Za-z0-9_-]+)/g;
const ANALOG_TOKEN_DEFINITION_PATTERNS = [
  /(--analog-[A-Za-z0-9_-]+)\s*:/g,
  /['"](--analog-[A-Za-z0-9_-]+)['"]\s*:/g,
];
const DEFAULT_ALLOWED_TOKEN_PATTERNS = [
  /^--analog-light-angle-[A-Za-z0-9_-]+$/u,
  /^--analog-light-power$/u,
];
const FINISH_CHANNEL_PATTERN = /rgb\(\s*var\(--analog-(?:highlight|shadow)-rgb\)/iu;
const LIGHTING_CONTEXT_PATTERN =
  /useAnalogLighting\s*\(|--analog-light-power\b|--analog-light-angle-[A-Za-z0-9_-]+\b/u;
const themeTokenCache = new Map();

function getSourceCode(context) {
  return context.sourceCode ?? context.getSourceCode();
}

function getFilename(context) {
  return context.filename ?? context.getFilename();
}

function getPatternExcerpt(text, match) {
  const excerpt = match[0].replace(/\s+/g, ' ').trim();
  return excerpt.length > 72 ? `${excerpt.slice(0, 69)}...` : excerpt;
}

function isCssSource(filename) {
  return /\.css(?:\.js)?$/u.test(filename);
}

function collectAnalogTokenDefinitions(text) {
  const tokens = new Set();

  for (const pattern of ANALOG_TOKEN_DEFINITION_PATTERNS) {
    pattern.lastIndex = 0;

    for (const match of text.matchAll(pattern)) {
      tokens.add(match[1]);
    }
  }

  return tokens;
}

function collectAnalogTokenReferences(text) {
  const references = [];
  ANALOG_TOKEN_REFERENCE_PATTERN.lastIndex = 0;

  for (const match of text.matchAll(ANALOG_TOKEN_REFERENCE_PATTERN)) {
    references.push({
      token: match[1],
      start: (match.index ?? 0) + match[0].indexOf(match[1]),
    });
  }

  return references;
}

function readThemeTokens(themeFile) {
  if (!themeFile) {
    return new Set();
  }

  const resolvedThemeFile = resolve(process.cwd(), themeFile);

  if (themeTokenCache.has(resolvedThemeFile)) {
    return themeTokenCache.get(resolvedThemeFile);
  }

  let tokens = new Set();

  try {
    tokens = collectAnalogTokenDefinitions(readFileSync(resolvedThemeFile, 'utf8'));
  } catch {
    tokens = new Set();
  }

  themeTokenCache.set(resolvedThemeFile, tokens);
  return tokens;
}

function getTokenRuleOptions(context) {
  const options = context.options[0] ?? {};
  const optionTokens = Array.isArray(options.tokens) ? options.tokens : [];
  const optionAllowedPatterns = Array.isArray(options.allowedPatterns)
    ? options.allowedPatterns
    : [];

  return {
    knownTokens: new Set([...readThemeTokens(options.themeFile), ...optionTokens]),
    allowedPatterns: [
      ...DEFAULT_ALLOWED_TOKEN_PATTERNS,
      ...optionAllowedPatterns.map((pattern) => new RegExp(pattern, 'u')),
    ],
  };
}

function isAllowedToken(token, knownTokens, localTokens, allowedPatterns) {
  return (
    knownTokens.has(token) ||
    localTokens.has(token) ||
    allowedPatterns.some((pattern) => pattern.test(token))
  );
}

function findMatches(text, filename) {
  const patterns = isCssSource(filename)
    ? [...RAW_FINISH_PATTERNS, ...CSS_ONLY_PATTERNS]
    : RAW_FINISH_PATTERNS;
  const matches = findColorMixMatches(text);
  const seenRanges = new Set();

  for (const match of matches) {
    seenRanges.add(`${match.start}:${match.end}`);
  }

  for (const { pattern, message } of patterns) {
    pattern.lastIndex = 0;

    for (const match of text.matchAll(pattern)) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      const rangeKey = `${start}:${end}`;

      if (seenRanges.has(rangeKey)) {
        continue;
      }

      seenRanges.add(rangeKey);
      matches.push({
        start,
        end,
        message,
        excerpt: getPatternExcerpt(text, match),
      });
    }
  }

  return matches;
}

function findColorMixMatches(text) {
  const matches = [];
  const lowerText = text.toLowerCase();
  let searchIndex = 0;

  while (searchIndex < text.length) {
    const start = lowerText.indexOf('color-mix(', searchIndex);

    if (start === -1) {
      break;
    }

    let depth = 0;
    let end = -1;

    for (let index = start; index < text.length; index += 1) {
      const character = text[index];

      if (character === '(') {
        depth += 1;
      } else if (character === ')') {
        depth -= 1;

        if (depth === 0) {
          end = index + 1;
          break;
        }
      }
    }

    if (end === -1) {
      break;
    }

    const colorMixCall = text.slice(start, end);

    if (/\b(?:black|white)\b/iu.test(colorMixCall)) {
      matches.push({
        start,
        end,
        message:
          'Use var(--analog-highlight-color) or var(--analog-shadow-color) instead of black/white in color-mix() recipes.',
        excerpt: colorMixCall.replace(/\s+/g, ' ').trim(),
      });
    }

    searchIndex = end;
  }

  return matches;
}

const CSS_TEMPLATE_PREFIX = 'export default `';
const CSS_TEMPLATE_SUFFIX = '`;';

function escapeTemplateSource(text) {
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function adjustFirstLineColumn(value) {
  return typeof value === 'number' ? Math.max(1, value - CSS_TEMPLATE_PREFIX.length) : value;
}

function adjustCssMessageLocation(message) {
  const nextMessage = { ...message };

  if (nextMessage.line === 1) {
    nextMessage.column = adjustFirstLineColumn(nextMessage.column);
  }

  if (nextMessage.endLine === 1) {
    nextMessage.endColumn = adjustFirstLineColumn(nextMessage.endColumn);
  }

  return nextMessage;
}

const noRawFinishColors = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow bespoke raw color recipes in Analog component finish styles.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    const filename = getFilename(context);

    return {
      Program() {
        const text = sourceCode.getText();

        for (const match of findMatches(text, filename)) {
          context.report({
            loc: {
              start: sourceCode.getLocFromIndex(match.start),
              end: sourceCode.getLocFromIndex(match.end),
            },
            message: `${match.message} Found "${match.excerpt}".`,
          });
        }
      },
    };
  },
};

const noUnknownAnalogTokens = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow references to undefined Analog CSS tokens.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          themeFile: { type: 'string' },
          tokens: {
            type: 'array',
            items: { type: 'string' },
          },
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    ],
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    const { knownTokens, allowedPatterns } = getTokenRuleOptions(context);

    return {
      Program() {
        const text = sourceCode.getText();
        const localTokens = collectAnalogTokenDefinitions(text);
        const reportedTokens = new Set();

        for (const { token, start } of collectAnalogTokenReferences(text)) {
          if (
            reportedTokens.has(token) ||
            isAllowedToken(token, knownTokens, localTokens, allowedPatterns)
          ) {
            continue;
          }

          reportedTokens.add(token);
          context.report({
            loc: {
              start: sourceCode.getLocFromIndex(start),
              end: sourceCode.getLocFromIndex(start + token.length),
            },
            message: `Define "${token}" in theme.css, declare it locally, or add an explicit allow pattern before referencing it.`,
          });
        }
      },
    };
  },
};

const requireLightingForFinishChannels = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require Analog highlight/shadow finish channels to participate in the lighting system.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = getSourceCode(context);

    return {
      Program() {
        const text = sourceCode.getText();
        const match = text.match(FINISH_CHANNEL_PATTERN);

        if (!match || LIGHTING_CONTEXT_PATTERN.test(text)) {
          return;
        }

        const start = match.index ?? 0;

        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(start + match[0].length),
          },
          message:
            'Finish recipes using Analog highlight/shadow channels should include useAnalogLighting(), --analog-light-power, or --analog-light-angle-* context.',
        });
      },
    };
  },
};

const cssTextProcessor = {
  meta: {
    name: 'analog-design/css-text',
  },
  supportsAutofix: false,
  preprocess(text) {
    return [`${CSS_TEMPLATE_PREFIX}${escapeTemplateSource(text)}${CSS_TEMPLATE_SUFFIX}`];
  },
  postprocess(messageLists) {
    return messageLists.flat().map(adjustCssMessageLocation);
  },
};

export default {
  meta: {
    name: 'eslint-plugin-analog-design',
  },
  processors: {
    'css-text': cssTextProcessor,
  },
  rules: {
    'no-raw-finish-colors': noRawFinishColors,
    'no-unknown-analog-tokens': noUnknownAnalogTokens,
    'require-lighting-for-finish-channels': requireLightingForFinishChannels,
  },
};
