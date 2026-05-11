import { defineCollection, z } from 'astro:content';
import { glob, type Loader, type LoaderContext } from 'astro/loaders';
import { fileURLToPath } from 'node:url';

import { componentApiLoader } from './lib/component-api-loader';

function ignoreSameFileDuplicateWarnings(loader: Loader): Loader {
  return {
    ...loader,
    async load(context: LoaderContext) {
      const logger = Object.create(context.logger) as LoaderContext['logger'];

      logger.warn = (message: string) => {
        const duplicateId = /^Duplicate id "([^"]+)" found in (.*)\. Later items/.exec(message);

        if (duplicateId) {
          const [, id, filePath] = duplicateId;
          const existingFilePath = context.store.get(id)?.filePath;
          const absoluteExistingPath = existingFilePath
            ? fileURLToPath(new URL(existingFilePath, context.config.root))
            : undefined;

          if (absoluteExistingPath === filePath) {
            return;
          }
        }

        context.logger.warn(message);
      };

      await loader.load({
        ...context,
        logger,
      });
    },
  };
}

const docs = defineCollection({
  type: 'content_layer',
  loader: ignoreSameFileDuplicateWarnings(
    glob({
      base: './src/content/docs',
      pattern: ['**/*.md', '!**/_*/**/*.md', '!**/_*.md'],
    }),
  ),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(['introduction', 'getting-started', 'design', 'reference']),
    order: z.number(),
    navTitle: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const componentApiProp = z.object({
  name: z.string(),
  type: z.string(),
  defaultValue: z.string().optional(),
  description: z.string(),
});

const componentApis = defineCollection({
  type: 'content_layer',
  loader: componentApiLoader(),
  schema: z.object({
    title: z.string(),
    sections: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        props: z.array(componentApiProp),
      }),
    ),
  }),
});

export const collections = { docs, componentApis };
