import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { blockCatalog, type BlockName } from '../data/block-catalog';
import {
  componentDocs,
  type ComponentApiProp,
  type ComponentApiSection,
} from '../data/component-docs';

interface RegistryItemFile {
  path: string;
}

interface RegistryItem {
  name: string;
  title: string;
  files?: RegistryItemFile[];
}

interface RegistryDocument {
  items: RegistryItem[];
}

interface ExtractedProp {
  name: string;
  type: string;
  defaultValue?: string;
  description?: string;
}

interface ExtractedSection {
  title: string;
  interfaceName: string;
  defaults: Map<string, string>;
  props: ExtractedProp[];
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDir, '../../../../packages/analog-ui');
const registryPath = resolve(packageRoot, 'registry.json');

function compact(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function readRegistry() {
  return JSON.parse(readFileSync(registryPath, 'utf8')) as RegistryDocument;
}

function getPrimarySourcePath(item: RegistryItem) {
  const componentFile = item.files?.find((file) => file.path.endsWith('.tsx'));

  if (!componentFile) {
    throw new Error(`Missing TSX source file for registry item "${item.name}".`);
  }

  return resolve(packageRoot, componentFile.path);
}

function getInterfaceTitle(interfaceName: string) {
  return interfaceName.endsWith('Props') ? interfaceName.slice(0, -'Props'.length) : interfaceName;
}

function getJsDocComment(node: ts.Node) {
  const docs = (node as { jsDoc?: ts.JSDoc[] }).jsDoc ?? [];
  const comments = docs
    .map((doc) => doc.comment)
    .filter(Boolean)
    .map((comment) => {
      if (typeof comment === 'string') return comment;

      if (Array.isArray(comment)) {
        return comment.map((part) => part.text).join('');
      }

      return String(comment);
    })
    .map(compact)
    .filter(Boolean);

  return comments.length > 0 ? comments.join(' ') : undefined;
}

function getJsDocDefault(node: ts.Node) {
  const docs = (node as { jsDoc?: ts.JSDoc[] }).jsDoc ?? [];

  for (const doc of docs) {
    for (const tag of doc.tags ?? []) {
      if (tag.tagName.text === 'default' && tag.comment) {
        return compact(typeof tag.comment === 'string' ? tag.comment : String(tag.comment));
      }
    }
  }

  return undefined;
}

function getPropName(name: ts.PropertyName) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return name.getText();
}

function stringifyDefaultValue(initializer: ts.Expression, sourceFile: ts.SourceFile) {
  if (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)) {
    return JSON.stringify(initializer.text);
  }

  return compact(initializer.getText(sourceFile));
}

function stringifyType(typeNode: ts.TypeNode | undefined, sourceFile: ts.SourceFile) {
  if (!typeNode) return 'unknown';
  return compact(typeNode.getText(sourceFile));
}

function collectTypeAliases(sourceFile: ts.SourceFile) {
  const aliases = new Map<string, string>();

  for (const statement of sourceFile.statements) {
    if (!ts.isTypeAliasDeclaration(statement)) continue;
    aliases.set(statement.name.text, stringifyType(statement.type, sourceFile));
  }

  return aliases;
}

function resolvePropType(typeText: string, aliases: Map<string, string>) {
  return /^[A-Z][A-Za-z0-9_]*$/.test(typeText) && aliases.has(typeText)
    ? aliases.get(typeText)!
    : typeText;
}

function collectPropsFromMembers(
  members: ts.NodeArray<ts.TypeElement>,
  sourceFile: ts.SourceFile,
  aliases: Map<string, string>,
) {
  const props: ExtractedProp[] = [];

  for (const member of members) {
    if (!ts.isPropertySignature(member) || !member.name) continue;

    const type = stringifyType(member.type, sourceFile);

    props.push({
      name: getPropName(member.name),
      type: resolvePropType(type, aliases),
      defaultValue: getJsDocDefault(member),
      description: getJsDocComment(member),
    });
  }

  return props;
}

function collectBindingDefaults(
  binding: ts.BindingName,
  sourceFile: ts.SourceFile,
  defaults = new Map<string, string>(),
) {
  if (!ts.isObjectBindingPattern(binding)) return defaults;

  for (const element of binding.elements) {
    if (element.dotDotDotToken) continue;

    const propName = element.propertyName
      ? element.propertyName.getText(sourceFile).replace(/^['"]|['"]$/g, '')
      : element.name.getText(sourceFile);

    if (element.initializer) {
      defaults.set(propName, stringifyDefaultValue(element.initializer, sourceFile));
    }

    collectBindingDefaults(element.name, sourceFile, defaults);
  }

  return defaults;
}

function getForwardRefCallback(node: ts.Expression) {
  if (!ts.isCallExpression(node)) return undefined;

  const expression = node.expression;
  const isForwardRef =
    (ts.isPropertyAccessExpression(expression) && expression.name.text === 'forwardRef') ||
    (ts.isIdentifier(expression) && expression.text === 'forwardRef');

  if (!isForwardRef) return undefined;

  const callback = node.arguments[0];
  return callback && (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
    ? callback
    : undefined;
}

function getComponentDefaultValues(sourceFile: ts.SourceFile, componentName: string) {
  const defaults = new Map<string, string>();

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === componentName) {
      const firstParam = node.parameters[0];
      if (firstParam) collectBindingDefaults(firstParam.name, sourceFile, defaults);
    }

    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === componentName
    ) {
      const initializer = node.initializer;
      if (!initializer) return;

      const callback = getForwardRefCallback(initializer);
      const firstParam = callback?.parameters[0];

      if (firstParam) {
        collectBindingDefaults(firstParam.name, sourceFile, defaults);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return defaults;
}

function extractSections(sourceFile: ts.SourceFile) {
  const aliases = collectTypeAliases(sourceFile);
  const sections: ExtractedSection[] = [];

  for (const statement of sourceFile.statements) {
    if (ts.isInterfaceDeclaration(statement) && statement.name.text.endsWith('Props')) {
      const title = getInterfaceTitle(statement.name.text);

      sections.push({
        title,
        interfaceName: statement.name.text,
        defaults: getComponentDefaultValues(sourceFile, title),
        props: collectPropsFromMembers(statement.members, sourceFile, aliases),
      });
    }

    if (
      ts.isTypeAliasDeclaration(statement) &&
      statement.name.text.endsWith('Props') &&
      ts.isTypeLiteralNode(statement.type)
    ) {
      const title = getInterfaceTitle(statement.name.text);

      sections.push({
        title,
        interfaceName: statement.name.text,
        defaults: getComponentDefaultValues(sourceFile, title),
        props: collectPropsFromMembers(statement.type.members, sourceFile, aliases),
      });
    }
  }

  return sections.filter((section) => section.props.length > 0);
}

function splitManualPropName(name: string) {
  return name
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
}

function findManualSection(name: BlockName, title: string) {
  const manualSections = componentDocs[name].api;
  return (
    manualSections.find((section) => section.title === title) ??
    manualSections.find((section) => section.title.replace(/\s+/g, '') === title)
  );
}

function findManualProp(
  name: BlockName,
  section: ComponentApiSection | undefined,
  propName: string,
) {
  const sectionProp = section?.props.find((prop) => {
    if (prop.name === propName) return true;
    return splitManualPropName(prop.name).includes(propName);
  });

  if (sectionProp) return sectionProp;

  return componentDocs[name].api
    .flatMap((manualSection) => manualSection.props)
    .find((prop) => prop.name === propName || splitManualPropName(prop.name).includes(propName));
}

function getManualDefaultValue(manualProp: ComponentApiProp | undefined, propName: string) {
  if (!manualProp?.defaultValue) return undefined;

  const manualNames = splitManualPropName(manualProp.name);
  const manualDefaults = manualProp.defaultValue
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
  const propIndex = manualNames.indexOf(propName);

  if (propIndex >= 0 && manualDefaults.length === manualNames.length) {
    return manualDefaults[propIndex];
  }

  return manualProp.defaultValue;
}

function isManualPropCovered(manualProp: ComponentApiProp, generatedProps: ComponentApiProp[]) {
  const manualNames = splitManualPropName(manualProp.name);
  const generatedNames = new Set(generatedProps.map((prop) => prop.name));

  return manualNames.length > 0
    ? manualNames.every((manualName) => generatedNames.has(manualName))
    : generatedNames.has(manualProp.name);
}

function mergeWithManualDocs(name: BlockName, sections: ExtractedSection[]) {
  const generatedSections = sections.map((section) => {
    const manualSection = findManualSection(name, section.title);
    const generatedProps = section.props.map((prop) => {
      const manualProp = findManualProp(name, manualSection, prop.name);

      return {
        name: prop.name,
        type: prop.type,
        defaultValue:
          prop.defaultValue ??
          section.defaults.get(prop.name) ??
          getManualDefaultValue(manualProp, prop.name),
        description: prop.description ?? manualProp?.description ?? '',
      };
    });
    const manualExtraProps =
      manualSection?.props.filter((prop) => !isManualPropCovered(prop, generatedProps)) ?? [];

    return {
      title: section.title,
      description:
        manualSection?.description ??
        `Props declared by the ${section.interfaceName} TypeScript API.`,
      props: [...generatedProps, ...manualExtraProps],
    };
  });

  const generatedTitles = new Set(generatedSections.map((section) => section.title));
  const manualOnlySections = componentDocs[name].api.filter(
    (section) => !generatedTitles.has(section.title),
  );

  return [...generatedSections, ...manualOnlySections];
}

export function componentApiLoader() {
  return async () => {
    const registry = readRegistry();
    const registryItems = new Map(registry.items.map((item) => [item.name, item]));

    return (Object.keys(blockCatalog) as BlockName[]).map((name) => {
      const registryItem = registryItems.get(name);

      if (!registryItem) {
        throw new Error(`Missing registry item for component API "${name}".`);
      }

      const sourcePath = getPrimarySourcePath(registryItem);
      const sourceText = readFileSync(sourcePath, 'utf8');
      const sourceFile = ts.createSourceFile(
        sourcePath,
        sourceText,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const extractedSections = extractSections(sourceFile);

      if (extractedSections.length === 0) {
        throw new Error(`No *Props API declarations found in ${sourcePath}.`);
      }

      return {
        id: name,
        title: registryItem.title,
        sections: mergeWithManualDocs(name, extractedSections),
      };
    });
  };
}
